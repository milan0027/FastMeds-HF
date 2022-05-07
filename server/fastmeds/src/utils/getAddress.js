const axios = require('axios');

const getAddress = async (lat, long) => {
  const response = await axios.get(
    `https://apis.mapmyindia.com/advancedmaps/v1/9ae502f52c932dbb7390f1e765d4b40c/rev_geocode?lat=${lat}&lng=${long}`
  );
  let city = response.results[0].city;
  if (city === '') city = response.results[0].state;

  return {
    city,
    address: response.results[0].formatted_address,
  };
};

module.exports = getAddress;
