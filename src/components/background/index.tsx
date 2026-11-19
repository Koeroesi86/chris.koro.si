import classNames from 'classnames';
import { PureComponent, createRef } from 'react';
import { loadImages } from '../../utils/load-images';
import { Link, Particle, Point, createLinks, createParticles, linkDistance, magnetRadius, stepParticle } from './network';
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
  private particles: Particle[] = [];
  private pointer: Point | undefined;
  private frame: number | undefined;
  private lastTime: number | undefined;
  private fade = 0;

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
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerout', this.onPointerOut);
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
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerout', this.onPointerOut);
    this.clear();
    this.cancel();
  }

  private cancel = () => {
    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
      this.frame = undefined;
    }
    this.lastTime = undefined;
  };

  private clear = () => {
    const { width, height } = this.state;
    this.canvasContext?.clearRect(0, 0, width, height);
  };

  private animate = (time = performance.now()) => {
    const elapsed = Math.min(time - (this.lastTime ?? time), 50);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const { imageSize, speed } = this.settings;
    const { width, height } = this.state;
    const field = {
      width,
      height,
      margin: imageSize,
      speed,
      dt: reducedMotion ? 0 : elapsed / (1000 / 30),
      pointer: reducedMotion ? undefined : this.pointer,
    };

    this.lastTime = time;
    this.fade = Math.min(1, this.fade + elapsed / 2500);
    this.particles = this.particles.map((particle) => stepParticle(particle, field));
    this.clear();
    this.drawLinks();
    this.drawImages();
    this.frame = requestAnimationFrame(this.animate);
  };

  private update = () => {
    this.getParticles();
    this.cancel();
    this.animate();
  };

  private getImages = () => {
    loadImages(this.settings.imageAssets)
      .then((images) => {
        this.images = images;
        if (this.canvasContext) {
          this.canvasContext.imageSmoothingQuality = 'high';
        }
        this.fade = 0;
        this.update();
      })
      .catch((source) => console.warn(`couldn't load ${source}`));
  };

  private getParticles = () => {
    const { imageSize } = this.settings;
    const { width, height } = this.state;

    this.particles =
      this.particles.length === this.images.length
        ? this.particles
        : createParticles({ width, height, margin: imageSize, speed: 0, dt: 0 }, this.images.length);
  };

  private strokeLinks = (links: Link[], alpha: number) =>
    links.forEach(({ from, to, strength }) => {
      const context = this.canvasContext;
      if (!context) return;
      context.globalAlpha = this.fade * alpha * strength;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    });

  private drawLinks = () => {
    const { width, height } = this.state;
    const { pointer } = this;
    const context = this.canvasContext;

    if (!context) return;
    context.strokeStyle = '#fff';
    context.lineWidth = 1;
    this.strokeLinks(createLinks(this.particles, linkDistance(width, height, this.particles.length)), 0.35);
    this.strokeLinks(
      pointer
        ? createLinks([pointer, ...this.particles], magnetRadius).filter(({ from }) => from === pointer)
        : [],
      0.8
    );
  };

  private drawImages = () => {
    const { imageSize } = this.settings;
    const context = this.canvasContext;

    this.particles.forEach(({ x, y, depth }, index) => {
      const image = this.images[index];
      const size = imageSize * depth;
      if (!context || !image) return;
      context.globalAlpha = this.fade * (0.4 + 0.6 * depth);
      context.drawImage(image, x - size / 2, y - size / 2, size, size / (image.width / image.height));
    });
  };

  private onPointerMove = ({ clientX, clientY }: PointerEvent) => {
    const { left, top } = this.component.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    this.pointer = { x: clientX - left, y: clientY - top };
  };

  private onPointerOut = ({ relatedTarget }: PointerEvent) => {
    this.pointer = relatedTarget ? this.pointer : undefined;
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
