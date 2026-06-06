import React, { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

export const ContainerScroll = ({ titleComponent, children }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scaleDimensions = () => (isMobile ? [0.7, 0.9] : [1.05, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="tw:flex tw:items-center tw:justify-center tw:relative tw:p-2 md:tw:p-20"
      ref={containerRef}
    >
      <div
        className="tw:py-10 md:tw:py-40 tw:w-full tw:relative"
        style={{ perspective: '1000px' }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

const Header = ({ translate, titleComponent }) => (
  <motion.div
    style={{ translateY: translate }}
    className="tw:max-w-5xl tw:mx-auto tw:text-center"
  >
    {titleComponent}
  </motion.div>
);

const Card = ({ rotate, scale, children }) => (
  <motion.div
    style={{ rotateX: rotate, scale, boxShadow:
      '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
    }}
    className="tw:max-w-5xl tw:-mt-12 tw:mx-auto tw:h-[30rem] md:tw:h-[40rem] tw:w-full tw:border-4 tw:border-[#6C6C6C] tw:p-2 md:tw:p-6 tw:bg-[#222222] tw:rounded-[30px] tw:shadow-2xl"
  >
    <div className="tw:h-full tw:w-full tw:overflow-hidden tw:rounded-2xl tw:bg-gray-100 dark:tw:bg-zinc-900 md:tw:rounded-2xl md:tw:p-4">
      {children}
    </div>
  </motion.div>
);
