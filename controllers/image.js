const Clarifai = require('clarifai');

const app = new Clarifai.App({
 apiKey: '0738174cda9f4394a3a585cc94e838d8'
});

const handleApiCall = (req, res) => {
  app.models
    .predict("a403429f2ddf4b49b307e318f00e528b", req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json('unable to work with API'))
}

const handleImage = (req, res, db) => {
  const { id, input } = req.body;
  
  db.select('link').from("submits").where('link', '=', input)
    .then(data=>{
      if (data[0]!==undefined){
        res.status(400).json("This face has already been detected")
      } else {
        db.transaction(trx=>{
          trx.insert({
            user_id: id,
            link: input
          })
          .into('submits')
          .returning('user_id')
          .then(submitUser=>{
            return trx('users')
              .returning('*').where('id','=',submitUser[0])
              .increment('entries', 1)
              .returning('entries')
              .then(entries=>{
                // console.log(submitUser[0])
                // res.json(entries[0])

                db.select('link').from('submits')
                  .where('user_id','=',submitUser[0])
                  .then(rows => {
                    res.json({_entries:entries[0], _links:rows})
                  })
              })

          })
          .then(trx.commit)
          .catch(trx.rollback)
        })
      }
    })

  // db('users').where('id', '=', id)
  // .increment('entries', 1)
  // .returning('entries')
  // .then(entries => {
  //   res.json(entries[0]);
  // })
  // .catch(err => res.status(400).json('unable to get entries'))
}

module.exports = {
  handleImage,
  handleApiCall
}