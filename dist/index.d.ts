import * as React from 'react';
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
declare class IMouseState {
    isVisible: boolean;
    isActive: boolean;
    isSelection: boolean;
    hoverTarget: HTMLElement;
    cursorLeft: number;
    cursorTop: number;
}
export default class IMouse extends React.Component<IMouseProps, IMouseState> {
    static instance: IMouse | Promise<IMouse>;
    static MOUNTPOINT_CLASS: string;
    static defaultProps: IMouseProps;
    static getMountpoint(): Element;
    static init(props?: IMouseProps): Promise<IMouse>;
    constructor(props: IMouseProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    handleMouseMove: (e: MouseEvent) => void;
    handleMouseOver: (e: MouseEvent) => void;
    handleMouseLeave: () => void;
    handleMouseDown: () => void;
    handleMouseUp: () => void;
    handleDragStart: (e: MouseEvent) => void;
    getStyles(): React.CSSProperties;
    render(): JSX.Element;
    destroy(): void;
}
export {};
