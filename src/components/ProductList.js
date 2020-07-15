import React from 'react';
import ProductItem from './ProductItem';
import { getProducts } from '../repository';
import { Link } from 'react-router-dom';

export default class ProductList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			products: [],
			category: 'Select category'
		}
		this.handleChange = this.handleChange.bind(this);
	}

	componentWillMount() {
		getProducts().then((products) => {
	      this.setState({ products });
	    });
	};

	handleChange(event) {
    this.setState({category: event.target.value});
  }

	render() {
		const { products } =  this.state;
		const category  =  ['Select category of products','Beverages', 'Fruits', 'Chocolates'];
		return (
			<div className=" container">
				<h3 className="card-title">List of Available Products</h3>
				<div>
					<select onChange={this.handleChange}>
					{
						category.map((product, index) => <option value={product}>{product}</option>)
					}
					</select>
				</div>
				<br/>
				{
					products.filter(product => product.category === this.state.category).map((selectedProduct, index) => <ProductItem product={selectedProduct}
					 key={index}/>)
				}
				<hr/>
				<Link to="/checkout"><button className="btn btn-success float-right">Checkout</button></Link>
				<Link to="/cart"><button className="btn btn-primary float-right" style={{  marginRight: "10px" }}>View Cart</button></Link>
				<br/><br/><br/>
			</div>
		);
	}
}
