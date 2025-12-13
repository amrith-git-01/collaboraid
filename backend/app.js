const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const contactRouter = require('./routes/contactRoutes');
const profilePhotoRouter = require('./routes/profilePhotoRoutes');
const eventRouter = require('./routes/eventRoutes');
const locationRouter = require('./routes/locationRoutes');
const organizationRouter = require('./routes/organizationRoutes');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

app.use(express.json());

app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/unite/api/users', userRouter);
app.use('/unite/api/contact', contactRouter)
app.use('/unite/api/profile-photo', profilePhotoRouter);
app.use('/unite/api/events', eventRouter);
app.use('/unite/api/location', locationRouter);
app.use('/unite/api/organizations', organizationRouter);


app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;