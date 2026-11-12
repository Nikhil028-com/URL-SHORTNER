import {Copy, Download, LinkIcon, Trash} from "lucide-react";
import {Link} from "react-router-dom";
import {Button} from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import {deleteUrl} from "@/db/apiUrls";
import {BeatLoader} from "react-spinners";

const LinkCard = ({url = [], fetchUrls}) => {
  const downloadImage = () => {
    const imageUrl = url?.qr;
    const fileName = url?.title; // Desired file name for the downloaded image

    // Create an anchor element
    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.download = fileName;

    // Append the anchor to the body
    document.body.appendChild(anchor);

    // Trigger the download by simulating a click event
    anchor.click();

    // Remove the anchor from the document
    document.body.removeChild(anchor);
  };

  const {loading: loadingDelete, fn: fnDelete} = useFetch(deleteUrl, url.id);

  const shortCode = url?.custom_url ? url?.custom_url : url?.short_url;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://trimrr.in";
  const fullShortUrl = `${origin}/${shortCode}`;

  return (
    <div className="flex flex-col md:flex-row gap-4 sm:gap-5 border border-border p-4 sm:p-5 bg-gray-900 rounded-xl w-full min-w-0 overflow-hidden shadow-sm">
      <div className="self-center md:self-start flex-shrink-0">
        <img
          src={url?.qr}
          className="h-28 w-28 sm:h-32 sm:w-32 object-contain ring-2 ring-blue-500 rounded-lg p-1 bg-white"
          alt="qr code"
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden gap-1.5">
        <Link
          to={`/link/${url?.id}`}
          className="text-xl sm:text-2xl md:text-3xl font-extrabold hover:underline cursor-pointer truncate block text-white"
          title={url?.title}
        >
          {url?.title}
        </Link>
        <a
          href={`/${shortCode}`}
          target="_blank"
          rel="noreferrer"
          className="text-base sm:text-xl md:text-2xl text-blue-400 font-bold hover:underline cursor-pointer break-all block"
          title={fullShortUrl}
        >
          {fullShortUrl}
        </a>
        <a
          href={url?.original_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 hover:underline cursor-pointer text-gray-400 text-xs sm:text-sm min-w-0"
          title={url?.original_url}
        >
          <LinkIcon className="p-0.5 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate">{url?.original_url}</span>
        </a>
        <span className="flex items-end font-light text-xs sm:text-sm text-gray-500 mt-2">
          {new Date(url?.created_at).toLocaleString()}
        </span>
      </div>

      <div className="flex gap-1.5 self-end md:self-center flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          title="Copy Link"
          onClick={() =>
            navigator.clipboard.writeText(fullShortUrl)
          }
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Download QR"
          onClick={downloadImage}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Delete Link"
          onClick={() => fnDelete().then(() => fetchUrls())}
          disabled={loadingDelete}
          className="hover:text-red-400"
        >
          {loadingDelete ? <BeatLoader size={5} color="white" /> : <Trash className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default LinkCard;
