const args = process.argv.slice(2);
const knex = require("knex")({
  client: 'postgresql',
  connection: {
    host     : 'localhost',
    user     : 'labber',
    password : 'labber',
    database : 'midterm',
    port     : 5432,
  }
});

const generateRandomString = () => {
  let r = Math.random().toString(36).substring(7);
  return r;
};

module.exports = function makeMapDataHelpers(knex) {
  return {

// Create map
  createMap: (name, description, userid, callback) => {
    const nameStr = name.toString();
    const descriptionStr = description.toString();
    const useridInt = parseInt(userid);
    let randomNum = generateRandomString().toString();
    return knex('maps')
    .insert({url: randomNum , name: nameStr , description: descriptionStr})
    .returning('id')
    .then((id) => {
      return knex('user_contributions').insert({user_id: userid, map_id: id[0]})
      .asCallback((err, res) => {
        if (err) {
          callback(err);
          process.exit(0);
        } else {
          callback(null, res);
          process.exit(0);
        }
      });
    });
  },

// Delete map
  deleteMap: (mapid, callback) => {
    const mapIdInt = parseInt(mapid);
    return Promise.all([
      knex('user_contributions')
      .where('map_id', mapIdInt)
      .del(),
      knex('user_favourites')
      .where('map_id', mapIdInt)
      .del()
    ])
    .then(() => {
      return knex('places')
      .where('map_id', mapIdInt)
      .del();
    })
    .then(() => {
      return knex('maps')
      .where('id', mapIdInt)
      .del();
    });
  },

  // deleteMap(args)
  //   .then((res) => {
  //     console.log('map is now gone', res)
  //     process.exit(0);
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //     process.exit(1);
  //   })


    // Find map
    //         by URL
  findMapByUrl: (url, callback) => {
    const urlStr = url.toString();
    return knex.select('id')
    .from('maps')
    .where('url', urlStr)
    .asCallback((err, res) => {
      if (err) {
        callback(err);
        process.exit(0);
      } else {
        callback(null, res);
        process.exit(0);
      }
    });
  },

    //         by user favourites
  findMapByFavourites: (userid, callback) => {
    const useridInt = parseInt(userid);
    return knex.select('map_id')
    .from('user_favourites')
    .where('user_id', useridInt)
    .asCallback((err, res) => {
      if (err) {
        callback(err);
        process.exit(0);
      } else {
      callback(null, res);
      process.exit(0);
      }
    });
  },

    //         by user contributions
  findMapByContribution: (userid, callback) => {
    const useridInt = parseInt(userid);
    return knex.select('map_id')
    .from('user_contributions')
    .where('user_id', useridInt)
    .asCallback((err, res) => {
      if (err) {
        callback(err);
        process.exit(0);
      } else {
        callback(null, res);
        process.exit(0);
      }
    });
  }


};
