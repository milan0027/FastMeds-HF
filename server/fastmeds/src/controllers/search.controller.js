const httpStatus = require('http-status');
const haversine = require('haversine-distance');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { User, Medicine } = require('../models');
const { userService } = require('../services');
const getAddress = require('../utils/getAddress');

const durationSort = (a, b) => {
  const x = parseFloat(a.duration);
  const y = parseFloat(b.duration);
  if (x > y) return 1;
  if (x === y) return 0;
  if (x < y) return -1;
};

const searchItem = catchAsync(async (req, res) => {
  // location of user searching medicine
  const lat = req.body.latitude;
  const long = req.body.longitude;
  const { city } = await getAddress(lat, long);

  // search stores with brand name
  const medUsers = await User.find({
    $and: [
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
  }).select('-inventory');

  // search stores with generic name
  const genericUsers = await User.find({
    $and: [
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
  }).select('-inventory');
  // merge both arrays
  const users = medUsers.concat(genericUsers);

  // if (users.length === 0) return res.send({});
  const point1 = { lat, lng: long };
  // now users contains list of all stores having the item
  // let url = `https://apis.mapmyindia.com/advancedmaps/v1/b6d9e46ed31ce0f81991b40dd46611d5/distance_matrix/driving/${lat},${long}`;
  // // url += lat + ',' + long;
  // users.forEach((item, index) => {
  //   url = url.concat(`;${item.latitude},${item.longitude}`);
  //   // url += ';' + item.latitude + ',' + item.longitude;
  // });
  // url = url.concat('?rtype=1&region=ind');

  // // calculate distance using api
  // const { data } = await axios.get(url);

  const destinations = users.map((item, index) => {
    // const itemObject=pick(item,['_id','name','latitude','longitude','city','address','contact','email','userType']);
    // console.log(itemObject);
    // console.log(data.results.durations[index+1],data.results.distances[index+1]);
    const point2 = { lat: item.latitude, lng: item.longitude };
    const distance = haversine(point1, point2);
    const duration = (distance * 6) / 100.0;
    return {
      _id: item._id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      city: item.city,
      address: item.address,
      contact: item.contact,
      email: item.email,
      userType: item.userType,
      duration: duration.toFixed(2),
      distance: distance.toFixed(2),
    };
  });

  destinations.sort(durationSort);
  // console.log(destinations);
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

  // console.log(list);
  res.send(list);
});

const getAllMedicine = catchAsync(async (req, res) => {
  const list = await Medicine.find({});
  res.send(list);
});

module.exports = {
  searchItem,
  addItem,
  deleteItem,
  itemList,
  getAllMedicine,
};
