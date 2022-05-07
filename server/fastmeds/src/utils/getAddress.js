const axios = require('axios');

const getAddress = async (lat, long) => {
  // console.log(lat,long);
  const response = await axios.get(
    `https://apis.mapmyindia.com/advancedmaps/v1/9ae502f52c932dbb7390f1e765d4b40c/rev_geocode?lat=${lat}&lng=${long}`
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
