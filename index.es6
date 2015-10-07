import React from 'react';

/* global window: false */
/* global document: false */
export default class AnimatedPanel extends React.Component {

  static get propTypes() {
    return {
      adTag: React.PropTypes.string,
      lazyLoad: React.PropTypes.bool,
      sizes: React.PropTypes.arrayOf(React.PropTypes.array),
    };
  }

  static get defaultProps() {
    return {
      lazyLoad: true,
      sizes: [ [ 60, 60 ], [ 70, 70 ], [ 300, 250 ], [ 1024, 768 ] ]
    }
  }

  constructor(...args) {
    super(...args);
    this.showElementWhenInView = this.showElementWhenInView.bind(this);
  }

  componentWillMount() {
    this.setState({ tagId: `googlead-${(Math.random() * 1e17) .toString(16)}` });
  }

  componentDidMount() {
    if (this.state && this.state.tagId) {
      /* global window document */
      if (typeof window !== 'undefined' && window.document &&
          !window.googletag) {
        window.googletag = { cmd: [] };
        const gads = document.createElement('script');
        gads.async = true;
        gads.type = 'text/javascript';
        const useSSL = 'https:' === window.location.protocol;
        gads.src = (useSSL ? 'https:' : 'http:') + '//www.googletagservices.com/tag/js/gpt.js';
        document.head.appendChild(gads);
      }
    }
    if (!this.props.lazyLoad && this.state && this.state.tagId) {
      this.generateAd();
    }
    window.addEventListener('scroll', this.showElementWhenInView);
    window.addEventListener('resize', this.showElementWhenInView);
    this.showElementWhenInView();
  }

  componentWillUnmount() {
    this.cleanupEventListeners();
  }

  isElementInViewport(elm) {
    const rect = React.findDOMNode(elm).getBoundingClientRect();
    return rect.bottom > 0 &&
      rect.right > 0 &&
      rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
      rect.top < (window.innerHeight || document.documentElement.clientHeight);
  }

  showElementWhenInView() {
    const containerElement = this.refs.container;
    if (this.isElementInViewport(containerElement) === true) {
      if (this.props.lazyLoad) { this.generateAd(); }
      const targetContainerElement = React.findDOMNode(containerElement);
      targetContainerElement.style.opacity = 1;
      targetContainerElement.style.transform = 'translateY(0px)';
      targetContainerElement.style.webkitTransform = 'translateY(0px)';
      this.cleanupEventListeners();
    }
  }

  cleanupEventListeners() {
    window.removeEventListener('scroll', this.showElementWhenInView);
    window.removeEventListener('resize', this.showElementWhenInView);
  }

  generateAd() {
    if ((window.googletag) && (this.props.adTag)) {
      const googleTag = window.googletag;
      googleTag.cmd.push(() => {
        const mappingAd = window.googletag.sizeMapping()
          .addSize([ 980, 200 ], [ 1024, 768 ])
          .addSize([ 0, 0 ], [ 300, 250 ])
          .build();
        const slot = googleTag.defineSlot(
          this.props.adTag,
          this.props.sizes,
          this.state.tagId)
          .setTargeting('resp_mpu_inline_ad', 'refresh')
          .addService(googleTag.pubads());
        if (this.props.sizes && this.props.sizes.length > 1) {
          slot.defineSizeMapping(mappingAd)
        }
        googleTag.pubads().enableSingleRequest();
        googleTag.enableServices();
        googleTag.display(this.state.tagId);
      });
    } else {
      const adToHide = React.findDOMNode(this.refs.container);
      adToHide.style.display = 'none';
      if (typeof console !== 'undefined' && console.error) {
        console.error('window.googletag not present, please put googletag js into html');
      }
    }
  }

  render() {
    let tag;
    if (this.state && this.state.tagId) {
      tag = (<div id={this.state.tagId}></div>);
    }
    return (
      <div ref="container" className="AnimatedPanel--container">
        <span ref="title" className="AnimatedPanel--title">Advertisement</span>
        <div ref="panel" className="AnimatedPanel--panel">
          <div ref="panelInner" className="AnimatedPanel--panel-inner">
          {tag}
          </div>
        </div>
      </div>
    );
  }
}
