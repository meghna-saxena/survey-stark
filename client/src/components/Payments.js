import React, { Component } from "react";
import StripeCheckout from "react-stripe-checkout";
import {connect} from 'react-redux';
import * as actions from '../actions';

class Payments extends Component {
  render() {
    return (
      <StripeCheckout
        name="SurveyStark"
        description="$5 for 5 survey/email credits"
        amount={500} //5$ = 500cents
        token={token => this.props.handleToken(token)} //callback func that gets called with a token received from stripe
        stripeKey={process.env.REACT_APP_STRIPE_KEY} //api key
      >
        <button className="btn">Add Credits</button> {/*child comp is displayed as btn rather than built-in btn by stripe checkout*/}
      </StripeCheckout>
    );
  }
}

export default connect(null, actions)(Payments);
