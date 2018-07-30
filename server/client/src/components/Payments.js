import React, { Component } from "react";
import StripeCheckout from "react-stripe-checkout";

class Payments extends Component {
  render() {
    debugger;
    return (
      <StripeCheckout
        amount={500} //5$ = 500cents)
        token={token => console.log(token)} //callback func that gets called with a token received from stripe
        stripeKey={process.env.REACT_APP_STRIPE_KEY} //api key
      />
    );
  }
}

export default Payments;
