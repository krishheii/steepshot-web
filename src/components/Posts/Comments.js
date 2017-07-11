import React from 'react';
import { Link } from 'react-router';
import { getPostComments } from '../../actions/posts';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class Comments extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      comments: [],
      avatar: this.props.item.avatar
    };
  }

  componentDidMount() {
    let _this = this;

    getPostComments(this.props.item.author, this.props.item.url).then((response) => {
      _this.setState({comments: response.results});
    });
  }

  setDefaultAvatar() {
    this.setState({ avatar: '/src/images/person.png' });
  }

  render() {
    let _this = this;
    let comments = <div>No comments</div>;

    let authorImage = this.state.avatar || '/src/images/person.png';
    const authorLink = `/userProfile/${this.props.item.author}`;

    if (this.state.comments.length != 0) {
      comments = this.state.comments.map((item) => {
        return <div className="comment">
            <div class="col-lg-2 col-md-2 col-sm-2 col-xs-2">
                <img width="40px" height="40px" className="user-avatar" src={authorImage} alt="Image" onError={this.setDefaultAvatar.bind(this)}/>
            </div>
            <div className="">
                <Link to={authorLink}><strong>{this.props.item.author}</strong></Link>
                <div className="comment-text">
                    {item.body}
                </div>
            </div>
        </div>
      });
    }

    return (
      <div className="comments-container">
          {comments}
      </div>
    );
  }
}

Comments.propTypes = {
  item: PropTypes.object
};

const mapStateToProps = (state) => {
  return {
    localization: state.localization
  };
};

export default connect(mapStateToProps)(Comments);
