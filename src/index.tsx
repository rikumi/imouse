import * as React from 'react';
import ReactDOM from 'react-dom';
import closest from 'closest';

interface IMouseProps {
    /**
     * 非 hover 默认状态下的光标背景颜色，CSS 格式
     * @default 'rgba(30, 111, 255, .1)'
     */
    defaultBackgroundColor?: string;

    /**
     * 非 hover 按下状态下的光标背景颜色，CSS 格式
     * @default 'rgba(30, 111, 255, .2)'
     */
    activeBackgroundColor?: string;

    /**
     * 非 hover 默认状态下的光标直径
     * @default 20
     */
    defaultSize?: number;

    /**
     * 非 hover 按下状态下的光标直径
     * @default 15
     */
    activeSize?: number;

    /**
     * hover 状态下的光标 padding 大小
     * @default 8
     */
    hoverPadding?: number;

    /**
     * hover 按下状态下的光标 padding 大小
     * @default 4
     */
    activePadding?: number;

    /**
     * hover 状态下的光标圆角半径
     * @default 8
     */
    hoverRadius?: number;

    /**
     * hover 按下状态下的光标圆角半径
     * @default 4
     */
    activeRadius?: number;

    /**
     * 文字选择状态下的光标宽度
     * @default 3
     */
    selectionWidth?: number;

    /**
     * 文字选择状态下的光标高度
     * @default 40
     */
    selectionHeight?: number;

    /**
     * 文字选择状态下的光标圆角半径
     * @default 2
     */
    selectionRadius?: number;

    /**
     * 允许 hover 的元素，CSS 选择器格式
     * @default 'a, button, input[type="button"], input[type="checkbox"], input[type="radio"], input[type="file"], input[type="submit"]'
     */
    hoverSelector?: string;

    /**
     * 非 hover 状态下的动效时长，单位 ms
     * @default 200
     */
    normalTransitionDuration?: number;

    /**
     * hover 状态下的动效时长，单位 ms
     * 值越大，甩动光标时发生的抖动越强烈
     * @default 50
     */
    hoverTransitionDuration?: number;

    /**
     * 非 hover 状态下的光标毛玻璃半径
     * @default 10
     */
    blurRadius?: number;

    /**
     * hover 状态下的光标发光点半径
     * @default 200
     */
    glowRadius?: number;

    /**
     * 光标的附加样式
     * @default {}
     */
    style?: React.CSSProperties;

    /**
     * Z 轴层级
     * @default 10000
     */
    zIndex?: number;
}

class IMouseState {
    isTouch = false;
    isVisible = false;
    isActive = false;
    isSelection = false;
    isSteadyHover = false;
    hoverTarget: HTMLElement;
    cursorLeft = 0;
    cursorTop = 0;
}

export default class IMouse extends React.Component<IMouseProps, IMouseState> {

    static instance: IMouse | Promise<IMouse> = null;

    static MOUNTPOINT_CLASS = 'imouse-mountpoint';

    static defaultProps: IMouseProps = {
        defaultBackgroundColor: 'rgba(30, 111, 255, .1)',
        activeBackgroundColor: 'rgba(30, 111, 255, .2)',
        defaultSize: 20,
        activeSize: 15,
        hoverPadding: 8,
        hoverRadius: 8,
        activePadding: 4,
        activeRadius: 4,
        selectionWidth: 3,
        selectionHeight: 40,
        selectionRadius: 2,
        hoverSelector: 'a, button, input[type="button"], input[type="checkbox"], input[type="radio"], input[type="file"], input[type="submit"]',
        normalTransitionDuration: 200,
        hoverTransitionDuration: 50,
        blurRadius: 10,
        glowRadius: 200,
        style: {},
        zIndex: 10000,
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

    setSteadyHoverTimeout: number = null;

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
        window.addEventListener('scroll', this.handleScroll);
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
        window.removeEventListener('scroll', this.handleScroll);
    }

    handleTouchStart = () => {
        this.setState({
            isTouch: true
        });
    }

    handleTouchEnd = () => {
        setTimeout(() => {
            this.setState({
                isTouch: false,
                isVisible: false,
            });
        }, 0);
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
            if (this.setSteadyHoverTimeout) {
                clearTimeout(this.setSteadyHoverTimeout);
                this.setSteadyHoverTimeout = null;
            }

            this.setState({ isSteadyHover: false });

            if (target instanceof HTMLElement && hoverTarget) {
                this.setState({ hoverTarget });

                this.setSteadyHoverTimeout = setTimeout(() => {
                    this.setState({ isSteadyHover: true });
                    this.setSteadyHoverTimeout = null;
                }, this.props.normalTransitionDuration);
            } else {
                this.setState({ hoverTarget: null });
            }
        }
    }

    handleMouseLeave = () => {
        this.setState({
            isVisible: false,
            isActive: false,
        });
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

    handleScroll = () => {
        this.setState({
            hoverTarget: null
        });
    }

    getContainerStyles() {
        const { zIndex } = this.props;
        const { isVisible, cursorLeft, cursorTop } = this.state;

        const styles: React.CSSProperties = {
            position: 'fixed',
            zIndex: zIndex,
            pointerEvents: 'none',
            opacity: isVisible ? 1 : 0,
            left: cursorLeft + 'px',
            top: cursorTop + 'px',
            width: 0,
            height: 0,
        };

        return styles;
    }

    getCursorStyles(clientRect: ClientRect) {
        const {
            defaultBackgroundColor, activeBackgroundColor,
            defaultSize, activeSize,
            hoverPadding, activePadding,
            hoverRadius, activeRadius,
            selectionWidth, selectionHeight, selectionRadius,
            normalTransitionDuration, hoverTransitionDuration,
            blurRadius, style,
        } = this.props;

        const {
            isActive, isSelection, hoverTarget, isSteadyHover,
            cursorLeft, cursorTop,
        } = this.state;

        const styles: React.CSSProperties = {
            ...style,
            position: 'absolute',
            overflow: 'hidden',
            backgroundColor: isActive ? activeBackgroundColor : defaultBackgroundColor,
            transitionDuration: (isSteadyHover ? hoverTransitionDuration : normalTransitionDuration) + 'ms',
            transitionProperty: 'top, left, right, bottom, border-radius, background-color, backdrop-filter, -webkit-backdrop-filter, opacity',
        };

        if (hoverTarget) {
            const targetRect = clientRect;
            const padding = isActive ? activePadding : hoverPadding;
            const radius = isActive ? activeRadius : hoverRadius;
            styles.left = (targetRect.left - padding) - cursorLeft + 'px';
            styles.top = (targetRect.top - padding) - cursorTop + 'px';
            styles.right = cursorLeft - (targetRect.right + padding) + 'px';
            styles.bottom = cursorTop - (targetRect.bottom + padding) + 'px';
            styles.borderRadius = radius + 'px';
        } else {
            const width = isSelection ? selectionWidth : (isActive ? activeSize : defaultSize);
            const height = isSelection ? selectionHeight : (isActive ? activeSize : defaultSize);
            styles.left = styles.right = -width / 2;
            styles.top = styles.bottom = -height / 2;
            styles.borderRadius = (isSelection ? selectionRadius : defaultSize / 2) + 'px';
            styles.backdropFilter = `blur(${ blurRadius }px)`;
            styles.WebkitBackdropFilter = `blur(${ blurRadius }px)`;
        }

        return styles;
    }

    getCursorGlowStyles(clientRect: ClientRect) {
        const {
            defaultBackgroundColor,
            hoverPadding, activePadding,
            hoverRadius, activeRadius,
            normalTransitionDuration, hoverTransitionDuration,
            glowRadius,
        } = this.props;

        const {
            isActive, hoverTarget, isSteadyHover,
            cursorLeft, cursorTop,
        } = this.state;

        const styles: React.CSSProperties = {
            position: 'absolute',
            transitionDuration: (isSteadyHover ? hoverTransitionDuration : normalTransitionDuration) + 'ms',
            transitionProperty: 'all',
        };

        if (hoverTarget) {
            const targetRect = clientRect;
            const padding = isActive ? activePadding : hoverPadding;
            const radius = isActive ? activeRadius : hoverRadius;
            styles.left = cursorLeft - (targetRect.left - padding) - glowRadius + 'px';
            styles.top = cursorTop - (targetRect.top - padding) - glowRadius + 'px';
            styles.right = (targetRect.right + padding) - cursorLeft - glowRadius + 'px';
            styles.bottom = (targetRect.bottom + padding) - cursorTop - glowRadius + 'px';
            styles.borderRadius = radius * 2 + 'px';
            styles.backgroundImage = `radial-gradient(${ defaultBackgroundColor } 0%, transparent 50%)`;
        } else {
            styles.left = 0;
            styles.top = 0;
            styles.right = 0;
            styles.bottom = 0;
        }

        return styles;
    }

    render() {
        const { hoverTarget } = this.state;
        const clientRects = hoverTarget ? [...hoverTarget.getClientRects()] : [null];
        return <>
            <div className="imouse-container" style={this.getContainerStyles()}>
                {clientRects.map((rect, i) => <div className="imouse-cursor" style={this.getCursorStyles(rect)} key={clientRects.length + ',' + i}>
                    <div className="imouse-glow" style={this.getCursorGlowStyles(rect)}></div>
                </div>)}
            </div>
            <style>{':root, * { cursor: none !important; }'}</style>
        </>
    }

    destroy() {
        const mountpoint = IMouse.getMountpoint();
        ReactDOM.unmountComponentAtNode(mountpoint);
        document.body.removeChild(mountpoint);
    }
}