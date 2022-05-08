const axios = require('axios');

const getAddress = async (lat, long) => {
  // console.log(lat,long);
  const response = await axios.get(
    `https://apis.mapmyindia.com/advancedmaps/v1/b6d9e46ed31ce0f81991b40dd46611d5/rev_geocode?lat=${lat}&lng=${long}`
  );
  let city = response.data.results[0].city.toLowerCase();
  if (city === '') city = response.data.results[0].state.toLowerCase();

  // console.log(city);
  return {
    city,
    address: response.data.results[0].formatted_address.toLowerCase(),
  };
};

module.exports = getAddress;
