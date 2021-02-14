//Core
const express = require('express');
const mongoose = require('mongoose');
//Middleware
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();
//Router
const authRouter = require('../api/auth/auth.router');
const userRouter = require('../api/user/user.router');
const productRouter = require('../api/product/product.router');
const dailyRateRouter = require('../api/daily-rate/daily-rate.router');
//Handle logs
const accessLogStream = require('../utils/accessLogStream');

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
		this.startListening();
	}

	initServer() {
		this.server = express();
	}

	initMiddleware() {
		this.server.use(helmet());
		this.server.use(express.json());
		this.server.use(morgan('combined', { stream: accessLogStream }));
		this.server.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
	}

	initRouter() {
		this.server.use('/api/auth', authRouter);
		this.server.use('/api/users', userRouter);
		this.server.use('/api/product', productRouter);
		this.server.use('/api/daily-rate', dailyRateRouter);
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

	startListening() {
		this.server.listen(this.port, () => {
			console.log('Server started listening on port', this.port);
		});
	}
}

module.exports = Server;
