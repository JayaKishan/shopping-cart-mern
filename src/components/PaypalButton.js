import React from "react";
import ReactDOM from "react-dom";
import scriptLoader from "react-async-script-loader";
import Spinner from "./Spinner";
import { getCartProducts } from '../repository';

const CLIENT = {
  sandbox:"AXj1vvy_hVnei1lJ2jSjh2rykn1fBD6mR5Vx0xCxFGmqSBPQ6Hf9-vgaZO0GJ0lTXfqehVQB1889dEMA",
  production:"prod id"
};

const CLIENT_ID =
  process.env.NODE_ENV === "production" ? CLIENT.production : CLIENT.sandbox;

let PayPalButton = null;
class PaypalButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showButtons: false,
      loading: true,
      paid: false,
      products: [],
			total: 0
    };

    window.React = React;
    window.ReactDOM = ReactDOM;
  }

  componentDidMount() {
    const { isScriptLoaded, isScriptLoadSucceed } = this.props;

    if (isScriptLoaded && isScriptLoadSucceed) {
      PayPalButton = window.paypal.Buttons.driver("react", { React, ReactDOM });
      this.setState({ loading: false, showButtons: true });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { isScriptLoaded, isScriptLoadSucceed } = nextProps;

    const scriptJustLoaded =
      !this.state.showButtons && !this.props.isScriptLoaded && isScriptLoaded;

    if (scriptJustLoaded) {
      if (isScriptLoadSucceed) {
        PayPalButton = window.paypal.Buttons.driver("react", {
          React,
          ReactDOM
        });
        this.setState({ loading: false, showButtons: true });
      }
    }
  }
  createOrder = (data, actions) => {
    const { total } = this.state;
    return actions.order.create({
      purchase_units: [
        {
          description: +"Groceries",
          amount: {
            currency_code: "INR",
            value: total
          }
        }
      ]
    });
  };

  onApprove = (data, actions) => {
    actions.order.capture().then(details => {
      const paymentData = {
        payerID: data.payerID,
        orderID: data.orderID
      };
      console.log("Payment Approved: ", paymentData);
      this.setState({ showButtons: false, paid: true });
    });
  };

  componentWillMount() {
		let cart = localStorage.getItem('cart');
		if (!cart) return;
		getCartProducts(cart).then((products) => {
			let total = 0;
			for (var i = 0; i < products.length; i++) {
				total += products[i].price * products[i].qty;
			}
	    	this.setState({ products, total });
	    });
	}

  render() {
    const { showButtons, loading, paid,products, total } = this.state;

    return (
      <div className="main">
        {loading && <Spinner />}

        {showButtons && (
          <div>
            <div>
            {
              products.map((product, index) =>
                <div key={index}>
                  <p>
                    {product.name}
                    <small> (quantity: {product.qty})</small>
                    <span className="float-right text-primary">₹{product.qty * product.price}</span>
                  </p><hr/>
                </div>
              )
            }

            { products.length ? <div><h4><small>Total Amount:</small><span className="float-right text-primary">₹{total}</span></h4><hr/></div>: ''}
            </div>

            <PayPalButton
              createOrder={(data, actions) => this.createOrder(data, actions)}
              onApprove={(data, actions) => this.onApprove(data, actions)}
            />
          </div>
        )}

        {paid && (
          <div className="main">
            <h2>
              Your order placed successfully{" "}

            </h2>
          </div>
        )}
      </div>
    );
  }
}

export default scriptLoader(`https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=INR`)(PaypalButton);
