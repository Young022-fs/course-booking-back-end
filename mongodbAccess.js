const path = require('path');
let PropertiesReader = require("properties-reader");

let propertiesPath = path.resolve(__dirname, "./dbconnection.properties");
let properties = PropertiesReader(propertiesPath);

const dbPrefix = properties.get('db.prefix');
const dbHost = properties.get('db.host');
const dbName = properties.get('db.name');
const dbUser = properties.get('db.user');
const dbPassword = properties.get('db.password');
const dbParams = properties.get('db.params');

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { connect } = require('http2');

const uri = `${dbPrefix}${dbUser}:${dbPassword}${dbHost}${dbParams}`;

const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

async function connectDB() {
  try {
    client.connect();
    console.log('Connected to MongoDB');
    client.db('processedData');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

async function getCourses(){
  try {
    const database = client.db("processedData")
    const collection = database.collection("Subjects");

    const result = await collection.find({}).toArray()
    
    return result;

  } catch (error) {
    console.error(error.message);
  }
}

async function getCollection(collectionName){
  try {
    const database = client.db("processedData")
    const collection = database.collection(collectionName);

    const result = await collection.find({}).toArray()
    
    return result;

  } catch (error) {
    console.error(error.message);
  }
}

let search = async (searchValue)=>{
    
  try {
    // client.connect();
    const database = client.db("processedData");
    const collection = database.collection("Subjects");

    const result = await collection.find({
      $or: [
        { name: { $regex: searchValue, $options: 'i' } }, 
        { location: { $regex: searchValue, $options: 'i' } }
      ]
    }).toArray();
   
    console.log(result);
    return result

  }catch (error) {
    console.error(error.message); 
  }
}

// Fixed updateOrderSpaces function
let updateOrderSpaces = async (orderObject) => {
  try {
    const database = client.db("processedData");
    const collection = database.collection("Subjects");
    const cart = orderObject.cart || [];
    
    console.log("Processing cart items:", cart);
    
    // Process each course ID in the cart array
    for (const courseId of cart) {
      // Count how many times this course appears in the cart (quantity)
      const quantity = cart.filter(id => id === courseId).length;
      
      // Skip if we've already processed this course ID
      if (cart.indexOf(courseId) !== cart.lastIndexOf(courseId) && 
          cart.indexOf(courseId) !== cart.indexOf(courseId)) {
        continue; // Skip duplicates
      }
      
      const courseData = await collection.findOne({id: courseId});
      
      if (!courseData) {
        console.error(`Course not found: ${courseId}`);
      } else {
        if (courseData.availableInventory < quantity) {
          console.warn(`Not enough space for ${courseId}: requested ${quantity}, available ${courseData.availableInventory}`);
        } else {
          const result = await collection.updateOne(
            {id: courseId}, 
            {$inc: { availableInventory: -quantity }}
          );
          
          if (result.modifiedCount > 0) {
            console.log(`Updated ${courseId}: Available spaces decremented by ${quantity}`);
          } else {
            console.warn(`No spaces updated for ${courseId}`);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error updating order spaces: ${error.message}`);
    throw error;
  }
}

// Fixed addOrder function
let addOrder = async (orderObject) => {
  try {
    orderObject.time = new Date();
    
    const database = client.db("processedData");
    const collection = database.collection("orders");
    
    console.log("Processing order:", orderObject);
    
    const result = await collection.insertOne(orderObject);
    console.log(`Insertion ${result.insertedId}: Complete`);

    // Update the inventory based on the order
    await updateOrderSpaces(orderObject);
    
    return { success: true, orderId: result.insertedId };
  } catch (error) {
    console.error(`Error adding order: ${error.message}`);
    throw error;
  }
}

module.exports = {connectDB, getCourses, getCollection, search, addOrder};