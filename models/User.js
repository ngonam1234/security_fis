import mongoose from "mongoose";

const User = mongoose.Schema({
    id: {
        type: String,
        required: false,
    },
    fullname: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: false,
    },
    is_active: {
        type: Boolean,
        required: false,
    },
    role: {
        type: Number,
        required: false,
    },
    tier: {
        type: Number,
        required: false,
    },
    create_time: {
        type: Date,
        required: false,
    },
    mattermost_id: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    },
    telegram: {
        type: String,
        required: false,
    },
    tenant: {
        type: String,
        required: false,
    }
})


export default mongoose.model('User', User)
