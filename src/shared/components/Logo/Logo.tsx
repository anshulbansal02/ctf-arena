interface Props {
  size?: number;
  className?: string;
}

export function Logo({ size = 1, ...props }: Props) {
  const width = size * 160;
  const height = size * 25;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10.8462 24.9645C8.71435 24.9645 6.82423 24.4711 5.17586 23.4842C3.54948 22.4748 2.27474 21.0393 1.35166 19.1776C0.450553 17.2935 0 15.0729 0 12.5159C0 9.98133 0.450553 7.77198 1.35166 5.88786C2.25276 4.00375 3.5275 2.55701 5.17586 1.54767C6.82423 0.515889 8.73633 0 10.9122 0C13.8353 0 16.132 0.740188 17.8023 2.22057C19.4727 3.70094 20.5606 5.83179 21.0661 8.6131L16.5825 8.84862C16.2968 7.25609 15.6704 6.02244 14.7034 5.14767C13.7583 4.25048 12.4946 3.80188 10.9122 3.80188C8.93413 3.80188 7.36269 4.58692 6.19785 6.15702C5.03301 7.72712 4.45058 9.84675 4.45058 12.5159C4.45058 14.2879 4.71432 15.8243 5.2418 17.1253C5.76927 18.4262 6.51653 19.4243 7.48357 20.1197C8.45061 20.815 9.58249 21.1627 10.8792 21.1627C12.5715 21.1627 13.9012 20.6916 14.8682 19.7496C15.8353 18.8075 16.4507 17.4505 16.7144 15.6785L21.198 15.9141C20.7364 18.7851 19.6265 21.0169 17.8683 22.6094C16.11 24.1795 13.7693 24.9645 10.8462 24.9645Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path
        d="M29.3066 4.3402H22.2187V0.538318H40.7133V4.3402H33.5924V24.4262H29.3066V4.3402Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path
        d="M78.6445 0.538318H83.8863L92.3259 24.4262H87.8424L85.8973 18.7739H76.6335L74.6884 24.4262H70.2049L78.6445 0.538318ZM84.6445 15.0393L81.2819 4.9458L77.8862 15.0393H84.6445Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path
        d="M94.3717 6.45983H98.3277L98.4267 9.92525C98.7783 8.73647 99.2948 7.8617 99.9761 7.30095C100.679 6.7402 101.57 6.45983 102.646 6.45983H104.262V10.1608H102.613C101.251 10.1608 100.24 10.4748 99.5805 11.1028C98.9212 11.7084 98.5915 12.6954 98.5915 14.0636V24.4262H94.3717V6.45983Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path
        d="M113.853 24.83C112.117 24.83 110.589 24.4487 109.271 23.686C107.974 22.901 106.974 21.8019 106.271 20.3888C105.567 18.9757 105.216 17.3271 105.216 15.443C105.216 13.5813 105.567 11.944 106.271 10.5309C106.974 9.09535 107.963 7.99628 109.238 7.23366C110.534 6.44861 112.04 6.05609 113.754 6.05609C115.424 6.05609 116.886 6.4374 118.139 7.20002C119.414 7.96263 120.392 9.07292 121.073 10.5309C121.776 11.9664 122.128 13.6823 122.128 15.6785V16.6542H109.6C109.688 18.2019 110.106 19.3795 110.853 20.187C111.6 20.9944 112.611 21.3982 113.886 21.3982C114.809 21.3982 115.589 21.1851 116.227 20.7589C116.864 20.3103 117.304 19.6935 117.545 18.9085L121.864 19.1776C121.381 20.9271 120.425 22.3066 118.996 23.3159C117.589 24.3253 115.875 24.83 113.853 24.83ZM117.743 13.7608C117.655 12.3253 117.26 11.2486 116.556 10.5309C115.853 9.81311 114.919 9.45423 113.754 9.45423C112.611 9.45423 111.666 9.82432 110.919 10.5645C110.194 11.3047 109.754 12.3701 109.6 13.7608H117.743Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path
        d="M124.861 6.45983H128.685L128.784 9.55516C129.224 8.36637 129.905 7.4916 130.828 6.93086C131.751 6.34768 132.828 6.05609 134.059 6.05609C135.971 6.05609 137.444 6.68413 138.477 7.9402C139.532 9.17385 140.059 10.8225 140.059 12.886V24.4262H135.839V14.2655C135.839 12.6954 135.598 11.5178 135.114 10.7327C134.653 9.94768 133.872 9.55516 132.773 9.55516C131.631 9.55516 130.729 9.97011 130.07 10.8C129.411 11.6075 129.081 12.7626 129.081 14.2655V24.4262H124.861V6.45983Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path
        d="M148.791 24.83C146.923 24.83 145.428 24.4038 144.308 23.5515C143.209 22.6767 142.659 21.4655 142.659 19.9178C142.659 18.3926 143.121 17.1926 144.044 16.3178C144.989 15.4206 146.439 14.7813 148.396 14.4L154.231 13.2225C154.231 11.9664 153.945 11.0131 153.374 10.3626C152.802 9.71217 151.967 9.38694 150.868 9.38694C148.868 9.38694 147.67 10.3178 147.275 12.1795L142.956 11.9776C143.308 10.0935 144.165 8.63553 145.527 7.60376C146.89 6.57198 148.67 6.05609 150.868 6.05609C153.352 6.05609 155.231 6.70656 156.505 8.00749C157.802 9.286 158.451 11.1253 158.451 13.5253V20.0524C158.451 20.5234 158.527 20.8486 158.681 21.0281C158.835 21.2075 159.088 21.2972 159.44 21.2972H160V24.4262C159.648 24.5159 159.143 24.5608 158.484 24.5608C157.451 24.5608 156.615 24.3365 155.978 23.8879C155.363 23.4393 154.967 22.6879 154.791 21.6337C154.352 22.5982 153.593 23.372 152.516 23.9552C151.461 24.5384 150.22 24.83 148.791 24.83ZM149.648 21.701C151.033 21.701 152.143 21.286 152.978 20.4561C153.813 19.6262 154.231 18.5271 154.231 17.1589V16.1496L149.681 17.0916C148.758 17.2711 148.088 17.5627 147.67 17.9664C147.253 18.3701 147.044 18.886 147.044 19.5141C147.044 20.2094 147.264 20.7477 147.703 21.129C148.165 21.5103 148.813 21.701 149.648 21.701Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path
        d="M47.3463 0.594391H43.3628C42.9076 0.594391 42.5386 0.970975 42.5386 1.43551V24.4262H47.3463V17.215C47.3463 16.5522 47.8836 16.015 48.5463 16.015H61.3127C61.96 16.015 62.3547 15.2883 62.0116 14.7281L57.9481 8.09283C57.7676 7.79809 57.7833 7.42041 57.9877 7.14236L61.8107 1.94019C62.2182 1.38569 61.8305 0.594391 61.1514 0.594391H47.3463Z"
        fill="url(#paint0_linear_108_186)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_108_186"
          x1="61.4261"
          y1="0.944859"
          x2="42.257"
          y2="15.2882"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#58C2D9" />
          <stop offset="1" stopColor="#47CCBC" />
        </linearGradient>
      </defs>
    </svg>
  );
}
