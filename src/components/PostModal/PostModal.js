import React from 'react';
import {connect} from 'react-redux';
import {
  nextPostModal, previousPostModal, setFSNavigation, setFullScreen, setNewImageLoading, setPostModalOptions,
  setPostOffset
} from '../../actions/postModal';
import TimeAgo from 'timeago-react';
import {Link} from 'react-router-dom';
import Avatar from '../Common/Avatar/Avatar';
import {closeModal} from '../../actions/modal';
import ShowIf from '../Common/ShowIf';
import Flag from '../PostsList/Post/Flag/Flag';
import Vote from '../PostsList/Post/Vote/Vote';
import LoadingSpinner from '../LoadingSpinner/index';
import {copyToClipboard} from '../../actions/clipboard';
import ReactDOM from 'react-dom';
import PostContextMenu from '../PostContextMenu/PostContextMenu';
import Likes from '../PostsList/Post/Likes/Likes';
import FullScreenButtons from './FullScreenButtons/FullScreenButtons';
import {toggleVote} from '../../actions/vote';
import {setPowerLikeInd, setPowerLikeTimeout} from '../../actions/post';
import {openPushNot} from '../../actions/pushNotification';
import ImagesGallery from '../ImagesGallery/ImagesGallery';
import ReactPlayer from 'react-player'
import Comments from '../Comments/Comments';
import './postModal.css';
import Constants from '../../common/constants';
import {utils} from '../../utils/utils';
import {setComponentSize} from '../../utils/setComponentSize';
import {setCommentEditState} from "../../actions/comments";

class PostModal extends React.Component {

	static defaultProps = {
		showClose: true,
	};

	constructor() {
		super();
		this.setPostModalSize = this.setPostModalSize.bind(this);
		this.showFSNavigation = this.showFSNavigation.bind(this);
		this.fsCheckButtons = this.fsCheckButtons.bind(this);
		this.initKeyPress = this.initKeyPress.bind(this);
		this.resizePostModal = this.resizePostModal.bind(this);
	}

	componentDidMount() {
		window.addEventListener('keydown', this.initKeyPress);
		window.addEventListener('resize', this.resizePostModal);
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this.initKeyPress);
    window.removeEventListener('resize', this.resizePostModal);
	}

	componentWillReceiveProps(nextProps) {
		this.setCurrentPostOffset(nextProps);
	}

	setCurrentPostOffset(nextProps) {
    let post = document.getElementById(this.props.currentIndex);
    if (post && (post.offsetTop !== 0) && ((post.offsetTop) !== nextProps.offsetTop)) {
      this.props.setPostOffset(post.offsetTop);
    }
	}

	shouldComponentUpdate(nextProps) {
    if (utils.equalsObjects(nextProps, this.props)) return false;
    return true;
	}

	resizePostModal() {
		this.setPostModalSize(this.props.fullScreenMode);
	}

	checkFSFirstLast(isClick) {
		if (!this.props.fullScreenMode) {
			return;
		}
		if (isClick || (!isClick && !this.props.timeoutID)) {
			setTimeout(() => {
				if (this.props.firstPost) {
					this.fsNavMouseLeave();
				}
			}, 100);
		}
	}

	previousPost(isClick) {
		this.checkFSFirstLast(isClick);
    if (this.props.post.isPLOpen) return;
		if (!this.props.firstPost) {
			this.props.previous(this.props.currentIndex, !this.props.completeStatus);
		}
	}

	nextPost(isClick) {
		this.checkFSFirstLast(isClick);
		if (this.props.post.isPLOpen) return;
		if (this.props.fullScreenMode && this.props.newPostsLoading) {
			return;
		}
		if (!this.props.lastPost) {
			this.props.next(this.props.currentIndex, !this.props.completeStatus);
		}
	}

	initKeyPress(e) {
		if ((document.activeElement !== ReactDOM.findDOMNode(this.textArea))
			&& (this.props.isCommentEditing || !this.props.focusedTextInput)) {
			switch (e.keyCode) {
				case 37:
					this.previousPost();
					break;
				case 39:
					this.nextPost();
					break;
				case 27:
					if (this.props.fullScreenMode) {
            this.setFullScreen(false, false);
          } else if (this.props.isCommentEditing) {
            this.props.setCommentEditState('', this.props.currentIndex, false);
					} else {
						this.props.closeModal(this.props.point);
					}
					break;
				case 13:
					this.props.toggleVote(this.props.currentIndex);
					break;
				default:
					break;
			}
		}
	}

	lowNSFWFilter() {
		let fullScreenMode = this.props.fullScreenMode;
		let backgroundStyle = {backgroundColor: fullScreenMode ? 'rgba(0, 0, 0, .96)' : 'rgba(255, 255, 255, .96)'};
		let colorTitleStyle = {color: fullScreenMode ? '#ffffff' : '#000000'};
		let colorMessageStyle = {color: fullScreenMode ? '#f3f3f2' : '#696969'};
		let buttonColor = fullScreenMode ? {color: '#ffffff', backgroundColor: 'rgba(0, 0, 0, .96)'}
			: {color: '#000000', backgroundColor: 'rgba(255, 255, 255, .96)'};
		return (
			<div className="container-nsfw-filter_pos-mod">
				<ShowIf show={this.props.post['is_nsfw'] && !this.props.showAll}>
					<div className="curtain_pos-mod" style={backgroundStyle}>
						<p className="title-low-nsfw_pos-mod" style={colorTitleStyle}>NSFW content</p>
						<p className="message-low-nsfw_pos-mod"
							 style={colorMessageStyle}
						>This content is for adults only. Not recommended for children or sensitive individuals.</p>
						<button className="btn btn-index"
										onClick={() => this.props.setPostModalOptions({showAll: true})}
										style={buttonColor}
						>Show me
						</button>
					</div>
				</ShowIf>
				<ShowIf show={this.props.post['is_low_rated'] && !this.props.showAll && !this.props.post['is_nsfw']}>
					<div className="curtain_pos-mod" style={backgroundStyle}>
						<p className="title-low-nsfw_pos-mod" style={colorTitleStyle}>Low rated content</p>
						<p className="message-low-nsfw_pos-mod"
							 style={colorMessageStyle}
						>This content is hidden due to low ratings.</p>
						<button className="btn btn-index"
										onClick={() => this.props.setPostModalOptions({showAll: true})}
										style={buttonColor}
						>Show me
						</button>
					</div>
				</ShowIf>
			</div>
		)
	}

	loadingFilter(isFullScreen) {
    let holderClass = isFullScreen ? 'before-load-full-screen_pos-mod' : 'before-load-curtain_pos-mod';
    if (!this.props.newImageLoading) return null;
		return (
			<div className={holderClass} style={{width: '100%'}}>
				<LoadingSpinner/>
			</div>
		)
	}

	copyLinkToClipboard(e) {
		e.target.blur();
		this.props.copyToClipboard(
			document.location.origin + (this.props.isGolosService ? '/' + Constants.SERVICES.golos.name : '')
			+ '/post' + this.props.post.url.replace(/\/[\w-.]+/, '')
		);
	}

	renderImage() {
    let previousImageWidth;
    if (this.props.previousStyle && this.props.previousStyle.image) {
    	previousImageWidth = {width: this.props.previousStyle.image.width};
		}
		return (
			<div className="image-container_pos-mod"
					 style={this.props.style.imgCont || previousImageWidth}
					 onDoubleClick={(e) => this.setFullScreen(!this.props.fullScreenMode, e)}>
				{this.lowNSFWFilter()}
				{this.loadingFilter(false)}
				<button className="btn btn-default btn-xs"
								onClick={(e) => this.copyLinkToClipboard(e)}>Copy link
				</button>
				<ShowIf show={!this.props.isFSByScreenSize && !this.props.fullScreenMode && !this.props.singlePost}>
					<div className="full-screen-button_pos-mod"
							 onClick={this.setFullScreen.bind(this, true, false)}
					>
						<img className="img-full-screen" src="/images/shape.svg" alt="open full screen"/>
					</div>
				</ShowIf>
				<ShowIf show={!this.props.post.isVideo}>
					<ImagesGallery index={this.props.currentIndex}
												 styles={this.props.style.image}
												 isFullScreen={false}
												 setPostModalSize={this.setPostModalSize}/>
				</ShowIf>
				<ShowIf show={this.props.post.isVideo}>
					<div className="image-container_pos-mod image-container_vid-con"
							 style={this.props.style.imgCont || previousImageWidth}
					>
						<ReactPlayer
							width='100%'
							height='100%'
							url={this.props.urlVideo}
							playing={true}
							loop={true}/>
					</div>
				</ShowIf>
			</div>
		)
	}

	renderFullScreenImg() {
    let previousImageWidth;
    if (this.props.previousStyle && this.props.previousStyle.image) {
      previousImageWidth = {width: this.props.previousStyle.image.width};
    }
		return (
			<div>
				<div className="full-image-wrap_pos-mod"
						 style={this.props.style.imgCont || previousImageWidth}
						 onDoubleClick={(e) => this.setFullScreen(!this.props.fullScreenMode, e)}>
					{this.lowNSFWFilter()}
          {this.loadingFilter(true)}
					<button className="btn btn-default btn-xs full-screen-share_pos-mod"
									onClick={(e) => this.copyLinkToClipboard(e)}>Copy link
					</button>
					<ShowIf show={!this.props.post.isVideo}>
						<ImagesGallery index={this.props.currentIndex}
													 styles={this.props.style.image}
													 isFullScreen={true}
													 setPostModalSize={this.setPostModalSize}/>
					</ShowIf>
					<ShowIf show={this.props.post.isVideo}>
						<div className="video-con-fs_pos-mod"
								 style={this.props.style.imgCont || previousImageWidth}>
							<ReactPlayer
								height='100%'
								url={this.props.urlVideo}
								playing={true}
								loop={true}/>
						</div>
					</ShowIf>
				</div>
				<ShowIf show={this.props.fullScreenNavigation}>
					<div>
						<ShowIf show={!this.props.firstPost}>
							<div className="arrow-left-full-screen_post-mod"
									 onClick={this.previousPost.bind(this, true)}
									 onMouseEnter={this.fsNavMouseEnter.bind(this)}
									 onMouseLeave={this.fsNavMouseLeave.bind(this)}
							/>
						</ShowIf>
						<ShowIf show={!this.props.lastPost && !this.props.newPostsLoading}>
							<div className="arrow-right-full-screen_post-mod"
									 onClick={this.nextPost.bind(this, true)}
									 onMouseEnter={this.fsNavMouseEnter.bind(this)}
									 onMouseLeave={this.fsNavMouseLeave.bind(this)}
							/>
						</ShowIf>
						<ShowIf show={this.props.newPostsLoading}>
							<div className="loader-right-full-screen_post-mod"
									 onMouseEnter={this.fsNavMouseEnter.bind(this)}
									 onMouseLeave={this.fsNavMouseLeave.bind(this)}
							>
								<LoadingSpinner style={{
									position: 'absolute', top: '50%', left: '24%',
									transform: 'translate(-50%, -50%)', height: 38
								}} loaderClass="new-posts-spinner_post-mod"
								/>
							</div>
						</ShowIf>
					</div>
					<div className="close-full-screen_pos-mod"
							 onClick={this.setFullScreen.bind(this, false, false)}
							 onMouseEnter={this.fsNavMouseEnter.bind(this)}
							 onMouseLeave={this.fsNavMouseLeave.bind(this)}
					>
						<img className="img-full-screen" src="/images/shape-copy-6.svg" alt="close full screen"/>
					</div>
					<div className="cross-wrapper_modal"
							 onClick={this.closeFromFullScreen.bind(this, false)}
							 onMouseEnter={this.fsNavMouseEnter.bind(this)}
							 onMouseLeave={this.fsNavMouseLeave.bind(this)}
					>
						<div className="cross-full-screen_modal"/>
					</div>
					<div className="fs-post-amount_pos-mod">
						<ShowIf show={parseFloat(this.props.post.total_payout_reward)}>
							${this.props.post.total_payout_reward}
						</ShowIf>
					</div>
					<FullScreenButtons/>
				</ShowIf>
			</div>
		)
	}

	showFSNavigation() {
		clearTimeout(this.props.timeoutID);
		let timeoutID = setTimeout(() => {
			this.props.setFSNavigation(false, null);
		}, 6000);
		this.props.setFSNavigation(true, timeoutID);
	}

	fsRightLeft(isOpen) {
		if (isOpen) {
			window.addEventListener('keydown', this.fsCheckButtons);
		} else {
			window.removeEventListener('keydown', this.fsCheckButtons);
		}
	}

	fsCheckButtons(e) {
		if (e.keyCode !== 37 && e.keyCode !== 39 && e.keyCode !== 13) this.showFSNavigation();
	}

	closeFromFullScreen(isOpen) {
		this.setFullScreen(isOpen, false);
		this.props.closeModal(this.props.point);
	}

	setFullScreen(isOpen, e) {
		if (e && !e.target.src) {
			return;
		}
		if (this.props.singlePost || this.props.isFSByScreenSize) {
			return;
		}
		let timeoutID = null;
		if (isOpen) {
			window.addEventListener('mousemove', this.showFSNavigation);
			this.fsRightLeft(isOpen);
			timeoutID = setTimeout(() => {
				this.props.setFSNavigation(false, null);
			}, 6000);
		}
		if (!isOpen) {
			window.removeEventListener('mousemove', this.showFSNavigation);
			this.fsRightLeft(isOpen);
			clearTimeout(this.props.timeoutID);
			this.props.setFSNavigation(true, null);
		}
		this.setPostModalSize(isOpen);
		this.props.setFullScreen(isOpen, timeoutID);
	}

	fsNavMouseEnter() {
		clearTimeout(this.props.timeoutID);
		window.removeEventListener('mousemove', this.showFSNavigation);
		this.fsRightLeft();
		this.props.setFSNavigation(true, null);
	}

	fsNavMouseLeave() {
		window.addEventListener('mousemove', this.showFSNavigation);
		this.fsRightLeft(true);
	}

	longTapPLInd(timeDelay) {
		if (this.props.post.vote) {
			return;
		}
		if (!this.props.authUser) {
			return;
		}
		if (this.props.post.isPLOpen) {
			return;
		}
		let plTimeout = setTimeout(() => {
			this.props.setPowerLikeInd(this.props.currentIndex, true, 'modal');
		}, timeDelay);
		this.props.setPowerLikeTimeout(this.props.currentIndex, plTimeout);
	}

	breakLongTapPLInd() {
		clearTimeout(this.props.post.plTimeout);
	}

	render() {
		const authorLink = `/@${this.props.post.author}`;

		let previousContainerStyle;
		if (this.props.previousStyle) previousContainerStyle = this.props.previousStyle.container;

		let hideModalFS = this.props.style.container || previousContainerStyle;
		if (this.props.fullScreenMode) {
			hideModalFS = {
				position: 'absolute',
				top: '-5000px',
				visibility: 'hidden'
			}
		}
		return (
			<div>
				<div className="container_pos-mod" style={hideModalFS}>
					<ShowIf show={this.props.showClose && !this.props.style.isMobile}>
						<ShowIf show={!this.props.firstPost}>
							<div className="arrow-left-full-screen_post-mod" onClick={this.previousPost.bind(this)}/>
						</ShowIf>
						<ShowIf show={!this.props.lastPost && !this.props.newPostsLoading}>
							<div className="arrow-right-full-screen_post-mod" onClick={this.nextPost.bind(this)}/>
						</ShowIf>
						<ShowIf show={this.props.newPostsLoading}>
							<div className="loader-right-full-screen_post-mod" onClick={this.nextPost.bind(this)}>
								<LoadingSpinner style={{
									position: 'absolute', top: '50%', left: '50%',
									transform: 'translate(-50%, -53%)', width: 35, height: 35
								}} loaderClass="new-posts-spinner_post-mod"
								/>
							</div>
						</ShowIf>
					</ShowIf>
					{this.renderImage()}
					<div className="header_pos-mod"
							 style={this.props.style.headerCont}
					>
						<div className="date_pos-mod">
							<TimeAgo datetime={this.props.post.created}
											 locale='en_US'
											 className="time_pos-mod"
							/>
							<PostContextMenu style={{height: '22px', width: '22px', marginRight: this.props.showClose ? '38px' : 0}}
															 className="post-context-menu_post"
															 item={this.props.post}
															 index={this.props.currentIndex}
							/>
							<ShowIf show={this.props.showClose}>
								<div className="cont-close-btn_pos-mod" onClick={() => this.props.closeModal(this.props.point)}>
									<i className="close-btn_pos-mod"/>
								</div>
							</ShowIf>
						</div>
						<Link to={authorLink} className="user_pos-mod">
							<Avatar src={this.props.post.avatar}/>
							<div className="name_pos-mod">
								{this.props.post.author}
							</div>
						</Link>
					</div>
					<div className="description_pos-mod"
							 style={this.props.style.description}
							 ref={ref => this.descPosMod = ref}
					>
						<div className="card-controls_post card-controls-border_post">
							<Likes postIndex={this.props.currentIndex} style={{paddingLeft: 20}}/>
							<div className="card-buttons_post">
								<ShowIf show={parseFloat(this.props.post.total_payout_reward)}>
									<div className="amount">${this.props.post.total_payout_reward}</div>
								</ShowIf>
								<ShowIf show={this.props.authUser !== this.props.post.author}>
									<Flag postIndex={this.props.currentIndex}/>
								</ShowIf>
								<div className="position--relative">
									<div className="card-control-stop"/>
									<Vote postIndex={this.props.currentIndex}
												powerLikeIndPlace="modal"
												singlePost={this.props.singlePost}
									/>
								</div>
							</div>
						</div>
						<Comments point={this.props.currentIndex}/>
					</div>
				</div>
				<ShowIf show={this.props.fullScreenMode}>
					{this.renderFullScreenImg()}
				</ShowIf>
			</div>
		);
	}

	setPostModalSize(isFullScreen = false) {
		let style = setComponentSize(this.props.window, this.props.post.media[0].size, isFullScreen);
		if (JSON.stringify(style) !== JSON.stringify(this.props.style)) {
			this.props.setPostModalOptions({style});
		}
		if (this.props.isFSByScreenSize && this.props.fullScreenMode) {
			this.setFullScreen(false, false);
		}
		this.props.setNewImageLoading(false);
	}
}

const mapStateToProps = (state) => {
	let currentIndex = state.postModal.currentIndex;
	let post = state.posts[currentIndex];
	if (post) {
    const isFSByScreenSize = state.window.width < 1025;
		let urlVideo = post.media[0].url;
		let postsList = state.postsList[state.postModal.point];
		let isCommentEditing = state.comments[currentIndex] ? state.comments[currentIndex].commentEditing : null;
		return {
			post,
			postsList,
			urlVideo,
      isFSByScreenSize,
      isCommentEditing,
			completeStatus: post.completeStatus,
			...state.postModal,
			newPostsLoading: postsList.loading,
			isUserAuth: state.auth.user && state.auth.postingKey,
			authUser: state.auth.user,
			firstPost: postsList.posts[0] === currentIndex,
			lastPost: postsList.offset === currentIndex,
			focusedTextInput: state.textInput[Constants.TEXT_INPUT_POINT.COMMENT] ?
				state.textInput[Constants.TEXT_INPUT_POINT.COMMENT].focused : false,
			window: state.window,
			offsetTop: state.postModal.postOffset,
			isGolosService: state.services.name === Constants.SERVICES.golos.name
		};
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		setPostModalOptions: options => {
			dispatch(setPostModalOptions(options));
		},
		closeModal: (point) => {
			dispatch(closeModal(point));
		},
		copyToClipboard: (text) => {
			dispatch(copyToClipboard(text));
		},
		next: (index, isLoading) => {
			dispatch(nextPostModal(index, isLoading));
		},
		previous: (index, isLoading) => {
			dispatch(previousPostModal(index, isLoading));
		},
		toggleVote: (postIndex) => {
			dispatch(toggleVote(postIndex));
		},
		setFullScreen: (isOpen, timeoutID) => {
			dispatch(setFullScreen(isOpen, timeoutID));
		},
		setFSNavigation: (isVisible, timeoutID) => {
			dispatch(setFSNavigation(isVisible, timeoutID));
		},
		setPostOffset: (offset) => {
			dispatch(setPostOffset(offset));
		},
		setPowerLikeInd: (index, isOpen, place) => {
			dispatch(setPowerLikeInd(index, isOpen, place));
		},
		setPowerLikeTimeout: (index, plTimeout) => {
			dispatch(setPowerLikeTimeout(index, plTimeout));
		},
		setNewImageLoading: (isLoading) => {
			dispatch(setNewImageLoading(isLoading));
		},
		openPushNot: (index, pushNotBody) => {
			dispatch(openPushNot(index, pushNotBody));
		},
    setCommentEditState: (point, parentPost, commentEditing) => {
      dispatch(setCommentEditState(point, parentPost, commentEditing));
    }
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(PostModal);
