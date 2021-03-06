//Core
const express = require('express');
const mongoose = require('mongoose');
//Middleware
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
//Router
const authRouter = require('../api/auth/auth.router');
const userRouter = require('../api/user/user.router');
const dayRouter = require('../api/day/day.router');
const productRouter = require('../api/product/product.router');
const dailyRateRouter = require('../api/daily-rate/daily-rate.router');
//Docs
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger.json');

class Server {
	constructor() {
		this.server = null;
		this.port = process.env.PORT || 3001;
	}

	async start() {
		this.initServer();
		this.initMiddleware();
		this.initRouter();
		await this.initDatabase();
		this.initErrorHandling();
		this.startListening();
	}

	initServer() {
		this.server = express();
	}

	initMiddleware() {
		this.server.use(helmet());
		this.server.use(express.json());
		this.server.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
	}

	initRouter() {
		this.server.use('/api/auth', authRouter);
		this.server.use('/api/users', userRouter);
		this.server.use('/api/day', dayRouter);
		this.server.use('/api/product', productRouter);
		this.server.use('/api/daily-rate', dailyRateRouter);
		this.server.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
	}

	async initDatabase() {
		try {
			await mongoose.connect(process.env.MONGODB_URL, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false,
			});

			console.log('Database connection successful');
		} catch (error) {
			process.exit(1);
		}
	}

	initErrorHandling() {
		this.server.use((err, req, res, next) => {
			let status = 500;

			if (err.response) {
				status = err.response.status;
			}

			return res.status(status).send(err.message);
		});
	}

	startListening() {
		this.server.listen(this.port, () => {
			console.log('Server started listening on port', this.port);
		});
	}
}

module.exports = Server;
