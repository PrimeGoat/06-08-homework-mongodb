// You now have a Mongo Client and a jobscollection
// Keep you code routes Inside the MongoClient for this exercise ONLY:

const express = require('express');
const app = express();
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const uri = 'mongodb://localhost/firstdb';

// const client = new MongoClient(uri, {
// useNewUrlParser: true,
// useUnifiedTopology: true,
// });

MongoClient.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then((client) => {
	const db = client.db('firstdb');
	const placesCollection = db.collection('places');
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));

	//\*\*\*EVERYTHING EXCEPT app.listen.... GOES IN HERE

	app.get('/', (req, res)=>{
		placesCollection.countDocuments()
			.then(val => {
				console.log("Count is ", val);
			})

		return res.status(200).json({ confirmation: 'success'});
	});

	app.get('/count', (req, res)=>{
		placesCollection.countDocuments()
		.then(val => {
			return res.status(200).json({confirmation: 'success', message: `# of documents: ${val}`});
		})
	});

	app.get('/create', (req, res) => {
		placesCollection.countDocuments()
		.then(val => {
			if(val) { // Not empty
				console.log("Deleting all documents before adding collection");
				placesCollection.deleteMany({})
				.then(val => {
					console.log("Deleted records: ", val.deletedCount);
				}).then(val => {
					console.log("Documents created");
					addCollection(placesCollection);
				});
			} else {
				console.log("Documents created");
				addCollection(placesCollection);
			}
		});
		return res.status(200).json({ confirmation: 'success', message: 'created'});
	});

	app.get('/clear', (req, res) => {
		placesCollection.countDocuments()
			.then(val => {
				console.log("Counted documents, count is ", val);
				if(val) { // Not empty
					console.log("Deleting all documents");
					placesCollection.deleteMany({})
						.then(val => {
							console.log("Deleted.  Val is ", val.deletedCount);
						});
				}
			})

		return res.status(200).json({ confirmation: 'success', message: 'cleared'});
	});

	app.get('/remove', (req, res) => {
		placesCollection.drop();
		return res.status(200).json({ confirmation: 'success', message: 'Collection Dropped'});
	});

	// This isn't working
	app.delete('/delete/:name', (req, res) => {
		placesCollection.deleteMany({
			"name": req.params.name
		})
		.then(val => {
			return res.status(200).json({ confirmation: 'success', message: `${val.deletedCount} Record(s) with name ${req.params.name} deleted`});
		})
		.catch(err => {
			return res.status(500).json({ confirmation: 'failed', message: err});
		})
	});

	app.post('/insertone', (req, res) => {
		placesCollection.insertOne(req.body)
		.then(val => {
			placesCollection
			.find({})
			.toArray()
			.then(val => {
				return res.status(200).json({ confirmation: 'success', message: val});
			});
		})
	});

	app.get('/lessthan/:count', (req, res) => {
		console.log(req.params.count);
		placesCollection.find({
			sales: {
				$lt: Number(req.params.count)
			}
		})
		.toArray()
		.then(val => {
			res.status(200).json({confirmation: 'success', message: val});
		});
	});

	app.get('/sum/:industry', (req, res) => {
		placesCollection
		.aggregate([
			{
				$match: {
					industry: req.params.industry
				}
			}, {
				$group: {
					_id: 1,
					sumSales: { $sum: "$sales" }
				}
			}
		])
		.toArray()
		.then(val => {
			res.status(200).json({confirmation: 'success', message: val[0].sumSales});
		});
	});

	app.get('/between/:min/:max', (req, res) => {
		placesCollection.find({
			sales: {
				$lte: Number(req.params.max),
				$gte: Number(req.params.min)
			}
		})
		.sort({
			sales: 1
		})
		.toArray()
		.then(val => {
			res.status(200).json({confirmation: 'success', message: val});
		});
	});
});

app.listen(3000, () => {
	console.log('3000');
});

// create a get route '/', that shows json of all of the available data in the places collection
// create a get route '/remove' that deletes the places collection
// The route should then return a string saying 'Collection Dropped'
//create a post route '/create' that adds this collection of data to the places collection. But if the collection has data we need to remove the data before adding this data.
// The route should return a string saying 'Documents Created'

let addCollection = (input) => {
	return input.insertMany([
		{
			name: 'NextGen Advisors',
			industry: 'Professional Services',
			contact: 'John Rutton',
			city: 'Newark',
			state: 'NJ',
			sales: 535000,
		},
		{
			name: 'Receivers Inc',
			industry: 'Legal',
			contact: 'Stacey Martin',
			city: 'New York',
			state: 'NY',
			sales: 201000,
		},
		{
			name: 'Ethan Allen',
			industry: 'Textile',
			contact: 'Mark Shamburger',
			city: 'Seacaucus',
			state: 'NJ',
			sales: 735000,
		},
		{
			name: 'Russian River',
			industry: 'Transportation',
			contact: 'Phil Butterworth',
			city: 'Parsipanny',
			state: 'NJ',
			sales: 205000,
		},
		{
			name: 'Johnson',
			industry: 'Legal',
			contact: 'Beverly Stephens',
			city: 'Syracuse',
			state: 'NY',
			sales: 135000,
		},
		{
			name: 'Kravet',
			industry: 'Textile',
			contact: 'Jan Farnsworth',
			city: 'Ithaca',
			state: 'NY',
			sales: 105000,
		},
		{
			name: 'Wacomb',
			industry: 'Professional Services',
			contact: 'Larry Peters',
			city: 'Elizabeth',
			state: 'NJ',
			sales: 130000,
		},
		{
			name: 'Farnsworth',
			industry: 'Transportation',
			contact: 'Peter Dalton',
			city: 'Philadelphia',
			state: 'PA',
			sales: 437000,
		},
		{
			name: 'Barnes',
			industry: 'Legal',
			contact: 'John Percy',
			city: 'White Plains',
			state: 'NY',
			sales: 350000,
		},
	]);
};

//Create a get route '/count' that counts the documents and returns a string '# of documents: ' and the actual number of documents
//create a post route '/insertone' that will insert a record based on user input, (Postman). The route should return the json of the contents of the whole aray
//create a delete route '/delete' that removes a record based on a name parameter
//create a get route '/lessthan' that take a query from the url and finds all the records where the sales are less than the query number
//create a get route '/sum' that takes a parameter for the industry and then sums the total sales based on the industry parameter
//create a get route '/between' that takes 2 different parameters, one for the lowest conditional price, one for the highest conditional price. Route should send in json the items in db that fit this condition. Sort ascending by sales
// Todays Mongo Commands:
// countDocuments
// listCollections
// createCollection
// find
// findOne
// skip
// limit
// aggregate
// match
// insert
// insertMany
// deleteOne
// updateOne

// Query Operators
// $gt
// $lt
// $gte
// $and
// $or
// $project
// $group
// $set