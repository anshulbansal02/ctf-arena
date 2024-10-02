import { Logo } from "@/shared/components";

const attributions = [
  {
    name: "confetti-button",
    url: "https://codepen.io/coopergoeke/pen/wvaYMbJ",
    title: "Confetti Popper",
    text: "A wonderful and realistic confetti popper on button click made by Cooper Goeke.",
  },
  {
    name: "fireworks-simulator",
    url: "https://codepen.io/MillerTime/pen/XgpNwb",
    title: "Fireworks Simulator",
    text: "As realistic as it can get, a mind-blowing fireworks simulator by Caleb Miller.",
  },
  {
    name: "3d-button",
    url: "https://getcssscan.com/css-buttons-examples#:~:text=by-,Algolia,-Button%2031",
    title: "3D Button",
    text: "A fun elevated button by Algolia provided by CSS Scan.",
  },
  {
    name: "unsplash-images",
    url: "https://unsplash.com/",
    title: "Unsplash Images",
    text: "High quality images from Unsplash community members.",
  },
  {
    name: "flaticon-illustrations",
    url: "https://www.flaticon.com/",
    title: "Flaticon Illustrations",
    text: "Clean and delightful illustrations from Flaticon community members.",
  },
  {
    name: "tambola-ticket-generator",
    url: "http://www.fractalforums.com/non-fractal-related-chit-chat/90-number-bingo-ticket-algorithm/?PHPSESSID=19fb5b949dd49c4d16811fd775dcec9b",
    title: "Tambola/Housie Ticket Generation Algorithm",
    text: "A complex process of making unique tickets for the game of Tambola or Housie explained simply by Mark Henderson.",
  },
];

export default function AttributionPage() {
  return (
    <section className="mx-auto flex max-w-[600px] flex-col items-center px-4 py-16">
      <div>
        <Logo />
      </div>
      <h2 className="mt-8 text-xl font-medium">Attributions</h2>
      <p className="mt-3 text-center text-sm font-light text-slate-300">
        These acknowledgments recognize the contributions of developers and
        creators whose work has complemented this platform's experience. While
        this list is not exhaustive, the efforts of all libraries, code
        snippets, assets and algorithms contributors are equally valued and
        appreciated.
      </p>
      <ul className="mt-4">
        {attributions.map((attribution) => (
          <li key={attribution.name} className="mt-6">
            <div>
              <h2 className="text-base font-medium text-slate-200">
                {attribution.title}
              </h2>
              <p className="font-light text-slate-200">{attribution.text}</p>
              <p className="mt-1">
                <span className="text-slate-300">Source:&nbsp;</span>
                <a href={attribution.url} className="text-[#4EC8C8]">
                  {attribution.url}
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
