import React from 'react';
import {connect} from 'react-redux';
import InfinityScroll from "../InfinityScroll/InfinityScroll";
import {clearUsersList, getUsersList, initUsersList} from '../../actions/usersList';
import {documentTitle} from '../../utils/documentTitle';
import User from './User/User';
import './usersList.css';
import {utils} from "../../utils/utils";
import Constants from "../../common/constants";
import ShowIf from "../Common/ShowIf";
import LoadingSpinner from "../LoadingSpinner";

class UsersList extends React.Component {
	static defaultProps = {
		isComponentVisible: true,
		useScrollView: false,
		options: {},
		className: '',
		scrollPoint: 'body'
	};

	constructor(props) {
		super();
		props.clearUsersList(props.point);
		let usersListOptions = UsersList.userListOptions(props);
		props.initUsersList(usersListOptions);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.options && (nextProps.options.query !== this.props.options.query) && nextProps.point) {
			let usersListOptions = UsersList.userListOptions(nextProps);
			this.props.initUsersList(usersListOptions);
			this.props.getUsersList(nextProps.point);
		}
	}

	shouldComponentUpdate(nextProps) {
		return !utils.equalsObjects(nextProps, this.props);
	}

	static userListOptions(props) {
		return {
			point: props.point,
			loading: false,
			hasMore: true,
			users: [],
			offset: null,
			options: props.options
		};
	}

	getUsersList() {
		if (this.props.isComponentVisible && this.props.point) {
			this.props.getUsersList(this.props.point);
		}
	}

	componentDidMount() {
		if (this.props.point) {
			this.props.getUsersList(this.props.point);
		}
		documentTitle();
	}

	renderUsers() {
		if (this.props.users) {
      if (this.props.commonLoader && !this.props.users.length) {
        return null;
      }
      if ((!this.props.users || !this.props.users[0]) && !this.props.commonLoader) {
        return (
					<div className="empty-query-message">
            {Constants.EMPTY_QUERY}
					</div>
        );
      }
      let users = [];
      this.props.users.forEach((user, index) => {
        users.push(
					<User
						key={index}
						index={this.props.users[index]}
					/>,
        );
      });
      return users;
    }
	}

	render() {
		return (
			<InfinityScroll
				point={this.props.scrollPoint}
				fetch={this.getUsersList.bind(this)}
				hasMore={this.props.isComponentVisible && this.props.hasMore && this.props.users.length > 0}
			>
				<div className={'body_use-lis ' + this.props.className}>
					{this.renderUsers()}
					{this.props.children}
				</div>
				<ShowIf show={this.props.loading}>
					<div className="spinner_use-lis" key="usersListLoader"><LoadingSpinner/></div>
				</ShowIf>
			</InfinityScroll>
		);
	}
}

const mapStateToProps = (state, props) => {
	const point = props.point + 'JSON_OPTIONS:' + JSON.stringify(props.options);
	return {
		point,
		...state.usersList[point],
		options: props.options
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		initUsersList: (options) => {
			dispatch(initUsersList(options));
		},
		getUsersList: (point) => {
			dispatch(getUsersList(point));
		},
		clearUsersList: (point) => {
			dispatch(clearUsersList(point));
		},
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersList);
