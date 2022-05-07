const httpStatus = require('http-status');
const axios = require('axios');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { User, Medicine } = require('../models');
const { userService } = require('../services');
const getAddress = require('../utils/getAddress');

const durationSort = (a, b) => {
  if (a.duration > b.duration) return 1;
  if (a.duration === b.duration) return 0;
  if (a.duration < b.duration) return -1;
};

const searchItem = catchAsync(async (req, res) => {
  // location of user searching medicine
  const lat = req.body.latitude;
  const long = req.body.longitude;
  const { city } = getAddress(lat, long);

  // search stores with brand name
  const medUsers = await User.find({
    $and: [
      { userType: req.body.type },
      { city },
      {
        inventory: {
          $elemMatch: {
            medName: req.body.item,
            quantity: { $gte: req.body.quantity },
          },
        },
      },
    ],
  });

  // search stores with generic name
  const genericUsers = await User.find({
    $and: [
      { userType: req.body.type },
      { city },
      {
        inventory: {
          $elemMatch: {
            genericName: req.body.item,
            quantity: { $gte: req.body.quantity },
            generic: false,
          },
        },
      },
    ],
  });
  // merge both arrays
  const users = medUsers.concat(genericUsers);

  if (users.length === 0) return res.send({});

  // now users contains list of all stores having the item
  let url = `https://apis.mapmyindia.com/advancedmaps/v1/b6d9e46ed31ce0f81991b40dd46611d5/distance_matrix/driving/${lat},${long}`;
  // url += lat + ',' + long;
  users.forEach((item, index) => {
    url = url.concat(`;${item.latitude},${item.longitude}`);
    // url += ';' + item.latitude + ',' + item.longitude;
  });
  url = url.concat('?rtype=1&region=ind');

  // calculate distance using api
  const { data } = await axios.get(url);

  const destinations = users.map((item, index) => {
    return {
      ...item,
      duration: data.durations[index + 1],
      distacne: data.distances[index + 1],
    };
  });

  destinations.sort(durationSort);
  res.send(destinations);
  // return top 10 nearest stores
});

const addItem = catchAsync(async (req, res) => {
  // console.log(req.body);
  const user = await userService.getUserById(req.body.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const medArray = req.body.medicines;
  const n = medArray.length;
  for (let i = 0; i < n; i += 1) {
    // console.log(i);
    const { medName, genericName } = medArray[i];
    let index = -1;
    user.inventory.forEach((item, ind) => {
      if (item.medName === medName) {
        index = ind;
      }
    });
    if (index !== -1) {
      user.inventory[index].quantity += medArray[i].quantity;
    } else {
      const newItem = pick(medArray[i], ['medName', 'genericName', 'quantity', 'price', 'itemType']);
      newItem.generic = medName === genericName;
      user.inventory.push(newItem);

      const medicine = await Medicine.findOne({ name: medName });
      if (!medicine) {
        const newMedicine = new Medicine({ name: medName });
        await newMedicine.save();
      }

      const genMedicine = await Medicine.findOne({ name: genericName });
      if (!genMedicine) {
        const newMedicine = new Medicine({ name: genericName });
        await newMedicine.save();
      }
    }
  }
  await user.save();
  res.send(user);
});
const deleteItem = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.body.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const medArray = req.body.medicines;
  const n = medArray.length;
  for (let i = 0; i < n; i += 1) {
    const { medName, genericName } = medArray[i];
    let index = -1;
    user.inventory.forEach((item, ind) => {
      if (item.medName === medName) {
        index = ind;
      }
    });
    if (index !== -1) {
      if (user.inventory[index].quantity >= medArray[i].quantity) user.inventory[index].quantity -= medArray[i].quantity;
      else throw new ApiError(httpStatus.NOT_FOUND, `Item ${medName} not in stock`);
    } else {
      throw new ApiError(httpStatus.NOT_FOUND, `Item ${medName} not found`);
    }
  }
  await user.save();
  res.send(user);
});

const itemList = catchAsync(async (req, res) => {
  const { name } = req.body;
  const list = await Medicine.find({ name: { $regex: name, $options: 'i' } });

  res.send(list);
});

module.exports = {
  searchItem,
  addItem,
  deleteItem,
  itemList,
};
