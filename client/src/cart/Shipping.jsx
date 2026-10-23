import React, { useState } from "react";
import PageTitle from "../components/PageTitle";
import Footer from "../components/footer/Footer";
import CheckoutPath from "./CheckoutPath";
import { useDispatch, useSelector } from "react-redux";
import "./shipping.css";
import Header from "../components/header/Header";
import { Country, State, City } from "country-state-city";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { saveShippingInfo } from "../features/cart/cartSlice";
const Shipping = () => {
  const { shippingInfo } = useSelector((store) => store.cart);
  const [address, setAddress] = useState(shippingInfo.address || "");
  const [pinCode, setPinCode] = useState(shippingInfo.pinCode || "");
  const [phoneNo, setPhoneNo] = useState(shippingInfo.phoneNo || "");
  const [country, setCountry] = useState(shippingInfo.country || "");
  const [state, setState] = useState(shippingInfo.state || "");
  const [city, setCity] = useState(shippingInfo.city || "");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shippingInfoSubmit = (e) => {
    e.preventDefault();
    if (phoneNo.length !== 10) {
      toast.error("Please enter a 10 digit Mobile number");
      return;
    }
    dispatch(
      saveShippingInfo({ address, pinCode, phoneNo, country, state, city }),
    );
    navigate("/order/confirm");
  };
  return (
    <>
      <PageTitle title="Shipping info" />
      <Header />
      <CheckoutPath activePath={0} />
      <main className="th-shipping-page">
        <div className="th-shipping-container">
          {/* Page Header */}
          <div className="th-shipping-header">
            <div className="th-shipping-eyebrow">
              <span>STEP 1</span>
              <span>•</span> CHECKOUT <span>•</span> SHIPPING
            </div>

            <p>Enter your delivery details to continue with your order.</p>
          </div>
          {/* Form */}
          <form className="th-shipping-card" onSubmit={shippingInfoSubmit}>
            {/* Contact & Address */}
            <section className="th-shipping-section">
              <div className="th-section-heading">
                <span className="th-section-number">01</span>
                <div>
                  <h2>Contact & Address</h2>
                  <p>Where should we deliver your order?</p>
                </div>
              </div>
              <div className="th-form-group th-form-group-full">
                <label htmlFor="address"> Delivery Address </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Enter your complete address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="th-form-grid">
                <div className="th-form-group">
                  <label htmlFor="pinCode"> Pin Code </label>
                  <input
                    type="text"
                    id="pinCode"
                    name="pinCode"
                    placeholder="Enter pin code"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                  />
                </div>
                <div className="th-form-group">
                  <label htmlFor="phoneNo"> Phone Number </label>
                  <input
                    type="tel"
                    id="phoneNo"
                    name="phoneNo"
                    placeholder="10 digit mobile number"
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                  />
                </div>
              </div>
            </section>
            {/* Location */}
            <section className="th-shipping-section">
              <div className="th-section-heading">
                <span className="th-section-number">02</span>
                <div>
                  <h2>Location</h2> <p>Select your delivery location.</p>
                </div>
              </div>
              <div className="th-form-grid">
                <div className="th-form-group">
                  <label htmlFor="country"> Country </label>
                  <select
                    name="country"
                    id="country"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setState("");
                      setCity("");
                    }}
                  >
                    <option value=""> Select a country </option>
                    {Country.getAllCountries().map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="th-form-group">
                  <label htmlFor="state"> State </label>
                  <select
                    name="state"
                    id="state"
                    value={state}
                    disabled={!country}
                    onChange={(e) => {
                      setState(e.target.value);
                      setCity("");
                    }}
                  >
                    <option value=""> Select a state </option>
                    {country &&
                      State.getStatesOfCountry(country).map((s) => (
                        <option key={s.isoCode} value={s.isoCode}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="th-form-group th-form-group-full">
                  <label htmlFor="city"> City </label>
                  <select
                    name="city"
                    id="city"
                    value={city}
                    disabled={!state}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value=""> Select a city </option>
                    {country &&
                      state &&
                      City.getCitiesOfState(country, state).map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </section>
            {/* Bottom */}
            <div className="th-shipping-footer">
              <div className="th-shipping-note">
                <span>✓</span>
                <p>Check your address and contact details before continuing.</p>
              </div>
              <button type="submit" className="th-shipping-submit">
                Continue to Order <span>→</span>
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};
export default Shipping;
