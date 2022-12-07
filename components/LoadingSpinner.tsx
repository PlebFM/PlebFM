export default function LoadingSpinner() {
  return(
    <div className="w-full h-screen flex justify-center items-center bg-gradient-to-b from-pfm-purple-400 to-pfm-purple-100">
      <svg width="250" height="250" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin-slow drop-shadow-xl">
        <circle cx="125" cy="125" r="125" fill="white" fillOpacity="0.1"/>
        <circle cx="125" cy="125" r="108.553" stroke="black" strokeOpacity="0.2" strokeWidth="19.7368" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="125" cy="125" r="92.1053" stroke="black" strokeOpacity="0.2" strokeWidth="19.7368" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="125" cy="125" r="75.6579" stroke="black" strokeOpacity="0.2" strokeWidth="19.7368" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="125" cy="125" r="42.7632" stroke="black" strokeOpacity="0.2" strokeWidth="19.7368" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="125" cy="125" r="59.2105" stroke="black" strokeOpacity="0.2" strokeWidth="19.7368" strokeLinecap="round" strokeLinejoin="round"/>
        <g filter="url(#filter0_d_1154_7624)">
          <path d="M50.554 162.932C57.5495 176.662 68.2055 188.189 81.3438 196.24C94.4821 204.291 109.591 208.553 125 208.553C140.409 208.553 155.518 204.291 168.656 196.24C181.794 188.189 192.45 176.661 199.446 162.932" stroke="white" strokeWidth="23.6842" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <g filter="url(#filter1_d_1154_7624)">
          <path d="M50.554 162.932C50.6334 163.088 50.7133 163.244 50.7938 163.399" stroke="#C6C6C6" strokeWidth="23.6842" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <path d="M139.275 73.8471L168.896 38.5457L174.878 43.5649L166.881 76.7926L198.216 63.1479L204.197 68.1671L174.576 103.469L168.349 98.2436L186.04 77.1609L158.102 89.6452L155.749 87.6704L163.192 57.9892L145.501 79.072L139.275 73.8471Z" fill="#FFD599"/>
        <path d="M79.5446 97.9722L49.9232 62.6708L71.4963 44.5688L77.0914 51.2369L62.1864 63.7437L68.6044 71.3923L80.5676 61.354L86.1628 68.022L74.1995 78.0604L86.2126 92.377L79.5446 97.9722Z" fill="#FFD599"/>
        <defs>
          <filter id="filter0_d_1154_7624" x="22.9195" y="135.298" width="204.16" height="100.886" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset/>
            <feGaussianBlur stdDeviation="7.89474"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1154_7624"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1154_7624" result="shape"/>
          </filter>
          <filter id="filter1_d_1154_7624" x="22.9195" y="135.298" width="55.5086" height="55.7352" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset/>
            <feGaussianBlur stdDeviation="7.89474"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1154_7624"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1154_7624" result="shape"/>
          </filter>
        </defs>
      </svg>
    </div>
  )
}