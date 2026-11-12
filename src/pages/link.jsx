import DeviceStats from "@/components/device-stats";
import Location from "@/components/location-stats";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {UrlState} from "@/context";
import {getClicksForUrl} from "@/db/apiClicks";
import {deleteUrl, getUrl} from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import {Copy, Download, LinkIcon, Trash} from "lucide-react";
import {useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {BarLoader, BeatLoader} from "react-spinners";

const LinkPage = () => {
  const downloadImage = () => {
    const imageUrl = url?.qr;
    const fileName = url?.title;

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
  const navigate = useNavigate();
  const {user} = UrlState();
  const {id} = useParams();
  const {
    loading,
    data: url,
    fn,
    error,
  } = useFetch(getUrl, {id, user_id: user?.id});

  const {
    loading: loadingStats,
    data: stats,
    fn: fnStats,
  } = useFetch(getClicksForUrl, id);

  const {loading: loadingDelete, fn: fnDelete} = useFetch(deleteUrl, id);

  useEffect(() => {
    fn();
  }, []);

  useEffect(() => {
    if (!error && loading === false) fnStats();
  }, [loading, error]);

  if (error) {
    navigate("/dashboard");
  }

  let link = "";
  if (url) {
    link = url?.custom_url ? url?.custom_url : url.short_url;
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "https://trimrr.in";
  const fullShortUrl = `${origin}/${link}`;

  return (
    <>
      {(loading || loadingStats) && (
        <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
      )}
      <div className="flex flex-col lg:flex-row gap-8 justify-between w-full min-w-0">
        <div className="flex flex-col items-start gap-6 rounded-lg lg:w-2/5 w-full min-w-0">
          <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold hover:underline cursor-pointer break-words w-full">
            {url?.title}
          </span>
          <a
            href={`/${link}`}
            target="_blank"
            rel="noreferrer"
            className="text-lg sm:text-2xl md:text-3xl text-blue-400 font-bold hover:underline cursor-pointer break-all block w-full"
            title={fullShortUrl}
          >
            {fullShortUrl}
          </a>
          <a
            href={url?.original_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:underline cursor-pointer text-gray-400 text-sm max-w-full min-w-0"
            title={url?.original_url}
          >
            <LinkIcon className="p-0.5 h-5 w-5 flex-shrink-0" />
            <span className="truncate">{url?.original_url}</span>
          </a>
          <span className="flex items-end font-light text-xs sm:text-sm text-gray-400">
            {new Date(url?.created_at).toLocaleString()}
          </span>
          <div className="flex gap-2">
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
              onClick={() =>
                fnDelete().then(() => {
                  navigate("/dashboard");
                })
              }
              disabled={loadingDelete}
              className="hover:text-red-400"
            >
              {loadingDelete ? (
                <BeatLoader size={5} color="white" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="w-full flex justify-center lg:justify-start">
            <img
              src={url?.qr}
              className="w-full max-w-[280px] ring-2 ring-blue-500 p-2 bg-white rounded-lg object-contain"
              alt="qr code"
            />
          </div>
        </div>

        <Card className="lg:w-3/5 w-full min-w-0 bg-gray-900 border-border">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold">Stats</CardTitle>
          </CardHeader>
          {stats && stats.length ? (
            <CardContent className="flex flex-col gap-6 min-w-0 overflow-hidden">
              <Card className="bg-gray-800 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg text-gray-300">Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold">{stats?.length}</p>
                </CardContent>
              </Card>

              <CardTitle className="text-xl font-bold">Location Data</CardTitle>
              <Location stats={stats} />
              <CardTitle className="text-xl font-bold">Device Info</CardTitle>
              <DeviceStats stats={stats} />
            </CardContent>
          ) : (
            <CardContent className="text-gray-400">
              {loadingStats === false
                ? "No Statistics yet"
                : "Loading Statistics.."}
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
};

export default LinkPage;
