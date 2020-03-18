import * as React from 'react';
import ReactDOM from 'react-dom';
import closest from 'closest';

interface IMouseProps {
    defaultBackgroundColor?: string;
    activeBackgroundColor?: string;
    defaultSize?: number;
    activeSize?: number;
    hoverPadding?: number;
    activePadding?: number;
    hoverRadius?: number;
    activeRadius?: number;
    selectionWidth?: number;
    selectionHeight?: number;
    selectionRadius?: number;
    hoverSelector?: string;
    transitionDuration?: number;
    blurRadius?: number;
    style?: React.CSSProperties;
}

class IMouseState {
    isTouch = false;
    isVisible = false;
    isActive = false;
    isSelection = false;
    hoverTarget: HTMLElement;
    cursorLeft = 0;
    cursorTop = 0;
}

export default class IMouse extends React.Component<IMouseProps, IMouseState> {

    static instance: IMouse | Promise<IMouse> = null;

    static MOUNTPOINT_CLASS = 'imouse-mountpoint';

    static defaultProps: IMouseProps = {
        defaultBackgroundColor: 'rgba(0, 0, 0, .2)',
        activeBackgroundColor: 'rgba(0, 0, 0, .4)',
        defaultSize: 20,
        activeSize: 15,
        hoverPadding: 10,
        hoverRadius: 10,
        activePadding: 5,
        activeRadius: 5,
        selectionWidth: 3,
        selectionHeight: 40,
        selectionRadius: 2,
        hoverSelector: 'a',
        transitionDuration: 200,
        blurRadius: 10,
        style: {},
    }

    static getMountpoint() {
        let mountpoint = document.querySelector('.' + this.MOUNTPOINT_CLASS);
        if (mountpoint == null) {
            mountpoint = document.createElement('div');
            mountpoint.className = this.MOUNTPOINT_CLASS;
            document.body.appendChild(mountpoint);
        }
        return mountpoint;
    }

    static async init(props: IMouseProps = {}) {
        if (this.instance != null) {
            return this.instance;
        }
        return this.instance = new Promise(resolve => {
            ReactDOM.render(<IMouse {...props} ref={resolve} />, this.getMountpoint())
        });
    }

    constructor(props: IMouseProps) {
        super(props);
        this.state = new IMouseState();
    }

    componentDidMount() {
        IMouse.instance = this;

        document.body.addEventListener('touchstart', this.handleTouchStart);
        document.body.addEventListener('touchend', this.handleTouchEnd);
        document.body.addEventListener('mousemove', this.handleMouseMove);
        document.body.addEventListener('mouseover', this.handleMouseOver);
        document.body.addEventListener('mouseleave', this.handleMouseLeave);
        document.body.addEventListener('mousedown', this.handleMouseDown);
        document.body.addEventListener('mouseup', this.handleMouseUp);
        document.body.addEventListener('dragstart', this.handleDragStart);
    }

    componentWillUnmount() {
        IMouse.instance = null;
        
        document.body.removeEventListener('touchstart', this.handleTouchStart);
        document.body.removeEventListener('touchend', this.handleTouchEnd);
        document.body.removeEventListener('mousemove', this.handleMouseMove);
        document.body.removeEventListener('mouseover', this.handleMouseOver);
        document.body.removeEventListener('mouseleave', this.handleMouseLeave);
        document.body.removeEventListener('mousedown', this.handleMouseDown);
        document.body.removeEventListener('mouseup', this.handleMouseUp);
        document.body.removeEventListener('dragstart', this.handleDragStart);
    }

    handleTouchStart = () => {
        this.setState({
            isTouch: true
        });
    }

    handleTouchEnd = () => {
        this.setState({
            isTouch: false,
            isVisible: false,
        });
    }

    handleMouseMove = (e: MouseEvent) => {
        const { pageX, pageY } = e;
        const left = pageX - window.scrollX;
        const top = pageY - window.scrollY;
        this.setState({
            isVisible: !this.state.isTouch,
            cursorLeft: left,
            cursorTop: top,
            isSelection: !document.getSelection().isCollapsed
        });
    }

    handleMouseOver = (e: MouseEvent) => {
        const { target } = e;
        const hoverTarget = closest(target, this.props.hoverSelector, true);
        if (this.state.hoverTarget !== hoverTarget) {
            if (target instanceof HTMLElement && hoverTarget) {
                this.setState({ hoverTarget });
            } else {
                this.setState({ hoverTarget: null });
            }
        }
    }

    handleMouseLeave = () => {
        this.setState({ isVisible: false });
    }

    handleMouseDown = () => {
        this.setState({ isActive: true });
    }

    handleMouseUp = () => {
        this.setState({
            isActive: false,
            isSelection: !document.getSelection().isCollapsed
        });
    }

    handleDragStart = (e: MouseEvent) => {
        e.preventDefault();
    }

    getStyles() {
        const {
            defaultBackgroundColor, activeBackgroundColor,
            defaultSize, activeSize,
            hoverPadding, activePadding,
            hoverRadius, activeRadius,
            selectionWidth, selectionHeight, selectionRadius,
            transitionDuration, blurRadius,
            style
        } = this.props;

        const {
            isVisible, isActive, isSelection, hoverTarget,
            cursorLeft, cursorTop,
        } = this.state;

        const styles: React.CSSProperties = {
            ...style,
            position: 'fixed',
            cursor: 'none',
            zIndex: 10000000,
            pointerEvents: 'none',
            opacity: isVisible ? 1 : 0,
            backgroundColor: isActive ? activeBackgroundColor : defaultBackgroundColor,
            transformOrigin: 'center',
            transitionDuration: transitionDuration + 'ms',
            transitionProperty: 'width, height, transform, border-radius, background-color, backdrop-filter, -webkit-backdrop-filter',
        };

        if (hoverTarget) {
            const targetRect = hoverTarget.getBoundingClientRect();
            const padding = isActive ? activePadding : hoverPadding;
            const radius = isActive ? activeRadius : hoverRadius;
            const centerX = targetRect.left + targetRect.width / 2;
            const centerY = targetRect.top + targetRect.height / 2;
            const width = targetRect.width + padding * 2;
            const height = targetRect.height + padding * 2;
            styles.left = cursorLeft + 'px';
            styles.top = cursorTop + 'px';
            styles.width = width + 'px';
            styles.height = height + 'px';
            styles.transform = `translate(${ centerX - cursorLeft - width / 2 }px,${ centerY - cursorTop - height / 2 }px)`;
            styles.borderRadius = radius + 'px';
        } else if (isSelection) {
            styles.left = cursorLeft + 'px';
            styles.top = cursorTop + 'px';
            styles.width = selectionWidth + 'px';
            styles.height = selectionHeight + 'px';
            styles.transform = `translate(${ -selectionWidth / 2 }px,${ -selectionHeight / 2 }px)`;
            styles.borderRadius = selectionRadius + 'px';
            styles.backdropFilter = `blur(${ blurRadius }px)`;
            styles.WebkitBackdropFilter = `blur(${ blurRadius }px)`;
        } else {
            const size = isActive ? activeSize : defaultSize;
            const radius = size / 2;
            styles.left = cursorLeft + 'px';
            styles.top = cursorTop + 'px';
            styles.width = size + 'px';
            styles.height = size + 'px';
            styles.transform = `translate(${ -radius }px,${ -radius }px)`;
            styles.borderRadius = radius + 'px';
            styles.backdropFilter = `blur(${ blurRadius }px)`;
            styles.WebkitBackdropFilter = `blur(${ blurRadius }px)`;
        }

        return styles;
    }

    render() {
        return <>
            <div style={this.getStyles()}></div>
            <style>{':root, * { cursor: none !important; }'}</style>
        </>
    }

    destroy() {
        const mountpoint = IMouse.getMountpoint();
        ReactDOM.unmountComponentAtNode(mountpoint);
        document.body.removeChild(mountpoint);
    }
}