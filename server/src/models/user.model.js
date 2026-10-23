const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: [true, "Account already exist with this email address"],
      validate: [validator.isEmail, "Please enter valid email address"],
    },

    password: {
      type: String,
      require: function () {
        return !this.googleId;
      },
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    profilePicture: {
      type: String,
    },

    bodyMeasurements: {
      chestIn: {
        type: Number,
        min: 1,
        max: 100,
      },
      shoulderWidthIn: {
        type: Number,
        min: 1,
        max: 50,
      },
      waistIn: {
        type: Number,
        min: 1,
        max: 100,
      },
      inseamIn: {
        type: Number,
        min: 1,
        max: 60,
      },
      heightIn: {
        type: Number,
        min: 1,
        max: 100,
      },
    },
    preferredFit: {
      type: String,
      enum: ["slim", "regular", "oversized"],
      default: "regular",
    },

    roles: {
      type: [String],
      enum: ["user", "seller", "admin"],
      default: ["user"],
    },

    accountStatus: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },

    verifyOtp: {
      type: String,
      default: "",
    },

    verifyOtpExpireAt: {
      type: Number,
      default: 0,
    },

    isAccountVerified: {
      type: Boolean,
      default: false,
    },

    resetOtp: {
      type: String,
      default: "",
    },

    resetOtpExpireAt: {
      type: Number,
      default: 0,
    },

    cartData: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    favorites: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
      ],
      default: [],
    },
  },

  {
    timestamps: true,
    minimize: false,
  },
);

userSchema.methods.getToken = function () {
  return jwt.sign(
    { id: this._id, username: this.username, role: this.roles },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "5d",
    },
  );
};

userSchema.methods.comparePassword = async function (userEnteredPassword) {
  return await bcrypt.compare(userEnteredPassword, this.password);
};

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

module.exports = userModel;
