import React from 'react';
import {connect} from "react-redux";
import {CopyToClipboard} from "react-copy-to-clipboard";
import './clipboard.css';
import {pushMessage} from "../../../actions/pushMessage";

class Clipboard extends React.Component {

	componentDidUpdate() {
		try {
			this.button.click();
			this.props.pushMessage("URL has been copied in your clipboard");
		} catch (e) {
			this.props.pushMessage("Oops, unable to copy");
		}
	}

	render() {
		return (
			<CopyToClipboard text={this.props.text}
											 onCopy={() => {
											 }}
											 className="clipboard">
				<span ref={ref => this.button = ref}>Copy to clipboard</span>
			</CopyToClipboard>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		...state.clipboard
	};
};


const mapDispatchToProps = (dispatch) => {
	return {
		pushMessage: (message) => {
			dispatch(pushMessage(message))
		}
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Clipboard);
