import React from 'react';
import {UserLinkFunc} from '../../Common/UserLinkFunc';
import Tags from '../../PostsList/Post/Tags/Tags';
import './description.css';

class Description extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isDescriptionOpened: false
		}
	}

	openDescription() {
		this.setState({
			isDescriptionOpened: true
		});
	}

	render() {
		return (
			<div className="container_description">
				<p>{UserLinkFunc(true, this.props.title)}</p>
				<div className={(this.state.isDescriptionOpened || (this.props.description.length < 140))
							? 'collapse-opened' : 'collapse-closed'}
				>
					{UserLinkFunc(false, this.props.description)}
					<Tags tags={this.props.tags}/>
					<a className="lnk-more" onClick={this.openDescription.bind(this)}>Show more</a>
				</div>
			</div>);
	}
}

export default Description;
