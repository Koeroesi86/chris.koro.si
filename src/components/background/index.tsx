import classNames from 'classnames';
import { PureComponent, createRef } from 'react';
import { loadImages } from '../../utils/load-images';
import { Position, configurePosition, createPosition } from './positions';
import styles from './index.module.scss';

export interface BackgroundProps {
  canvasOpacity: number;
  imageSize: number;
  speed: number;
  speedTolerance: number;
  fadeFPS: number;
  animationFPS: number;
  fadeStep: number;
  animationType: string;
  backgroundImage?: string;
  imageAssets: string[];
}

interface BackgroundState {
  width: number;
  height: number;
  backgroundImage?: HTMLImageElement;
}

export class Background extends PureComponent<Partial<BackgroundProps>, BackgroundState> {
  static defaultProps: BackgroundProps = {
    canvasOpacity: 1,
    imageSize: 64,
    speed: 0.5,
    speedTolerance: 0.3,
    fadeFPS: 30,
    animationFPS: 30,
    fadeStep: 0.01,
    animationType: 'bounce',
    backgroundImage: undefined,
    imageAssets: [],
  };

  state: BackgroundState = { width: 0, height: 0, backgroundImage: undefined };

  private component = createRef<HTMLDivElement>();
  private canvas = createRef<HTMLCanvasElement>();
  private canvasContext: CanvasRenderingContext2D | null = null;
  private images: HTMLImageElement[] = [];
  private positions: Position[] = [];
  private frame: number | undefined;
  private timer: number | undefined;

  private get settings() {
    return { ...Background.defaultProps, ...this.props };
  }

  componentDidMount() {
    const { backgroundImage } = this.settings;

    if (backgroundImage) {
      loadImages([backgroundImage])
        .then(([image]) => this.setState({ backgroundImage: image }))
        .catch((source) => console.warn(`couldn't load ${source}`));
    }

    window.addEventListener('resize', this.onResize);
    this.onResize();
    this.canvasContext = this.canvas.current?.getContext('2d') ?? null;
    this.getImages();
  }

  componentDidUpdate(previousProps: Partial<BackgroundProps>) {
    const previous = previousProps.imageAssets ?? Background.defaultProps.imageAssets;
    const { imageAssets } = this.settings;

    if (previous.length !== imageAssets.length) {
      this.getImages();
      return;
    }

    if (JSON.stringify(previous) !== JSON.stringify(imageAssets)) {
      this.update();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    this.clear();
    this.cancel();
  }

  private cancel = () => {
    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
      this.frame = undefined;
    }
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  };

  private clear = () => {
    const { width, height } = this.state;
    this.canvasContext?.clearRect(0, 0, width, height);
  };

  private animate = () => {
    this.clear();
    this.drawImages();
    this.timer = window.setTimeout(() => {
      this.frame = requestAnimationFrame(this.animate);
    }, 1000 / this.settings.animationFPS);
  };

  private fadeIn = () => {
    const { fadeFPS, fadeStep } = this.settings;
    setTimeout(() => {
      const context = this.canvasContext;
      if (!context || context.globalAlpha >= 1) return;
      requestAnimationFrame(() => {
        context.globalAlpha += fadeStep;
        this.fadeIn();
      });
    }, 1000 / fadeFPS);
  };

  private update = () => {
    this.getPositions();
    this.cancel();
    this.animate();
  };

  private getImages = () => {
    loadImages(this.settings.imageAssets)
      .then((images) => {
        this.images = images;
        if (this.canvasContext) {
          this.canvasContext.imageSmoothingQuality = 'high';
          this.canvasContext.globalAlpha = 0;
        }
        this.update();
        this.fadeIn();
      })
      .catch((source) => console.warn(`couldn't load ${source}`));
  };

  private getPositions = () => {
    const { imageSize, speed, speedTolerance } = this.settings;
    const { width, height } = this.state;
    const options = { width, height, imageSize, speed, speedTolerance };

    this.positions =
      this.images.length !== this.positions.length
        ? this.images.map(() => createPosition(options))
        : this.positions.map((position) => configurePosition(position, options));
  };

  private drawImages = () => {
    const { imageSize } = this.settings;

    this.images
      .map((image, index) => ({
        image,
        x: this.positions[index].x - imageSize,
        y: this.positions[index].y - imageSize,
        width: imageSize,
        height: imageSize / (image.width / image.height),
      }))
      .forEach(({ image, x, y, width, height }) =>
        this.canvasContext?.drawImage(image, x, y, width, height)
      );
  };

  private onResize = () => {
    const { clientWidth, clientHeight } = this.component.current ?? { clientWidth: 0, clientHeight: 0 };
    this.setState({ width: clientWidth, height: clientHeight });
  };

  render() {
    const { backgroundImage, canvasOpacity } = this.settings;
    const { width, height } = this.state;

    return (
      <div
        className={classNames(styles.Background, { [styles.loaded]: !!this.state.backgroundImage })}
        ref={this.component}
        style={{
          backgroundImage: this.state.backgroundImage ? `url(${backgroundImage})` : undefined,
          opacity: canvasOpacity,
        }}
      >
        <canvas className={styles.backgroundCanvas} ref={this.canvas} width={width} height={height} />
      </div>
    );
  }
}

export default Background;
