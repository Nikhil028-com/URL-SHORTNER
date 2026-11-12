// can add sonner from shadcn ui after link created

import {useEffect, useState} from "react";
import {BarLoader} from "react-spinners";
import {Filter} from "lucide-react";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {CreateLink} from "@/components/create-link";
import LinkCard from "@/components/link-card";
import Error from "@/components/error";

import useFetch from "@/hooks/use-fetch";

import {getUrls} from "@/db/apiUrls";
import {getClicksForUrls} from "@/db/apiClicks";
import {UrlState} from "@/context";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {user} = UrlState();
  const {loading, error, data: urls, fn: fnUrls} = useFetch(getUrls, user.id);
  const {
    // get arrays of all of the urls 
    loading: loadingClicks,
    data: clicks,
    fn: fnClicks,
  } = useFetch(
    getClicksForUrls,
    urls?.map((url) => url.id)
  );

  useEffect(() => {
    fnUrls();
  }, []);

  const filteredUrls = urls?.filter((url) =>
    url.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (urls?.length) fnClicks();
  }, [urls?.length]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full min-w-0">
      {(loading || loadingClicks) && (
        <BarLoader width={"100%"} color="#36d7b7" />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl text-gray-300">Links Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-extrabold">{urls?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl text-gray-300">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-extrabold">{clicks?.length || 0}</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold">My Links</h1>
        <CreateLink />
      </div>
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Filter Links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 bg-gray-900 border-border text-white"
        />
        <Filter className="absolute top-2.5 right-3 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
      {error && <Error message={error?.message} />}
      <div className="flex flex-col gap-4 w-full min-w-0">
        {(filteredUrls || []).map((url) => (
          <LinkCard key={url?.id} url={url} fetchUrls={fnUrls} />
        ))}
        {filteredUrls && filteredUrls.length === 0 && (
          <div className="p-8 text-center text-gray-400 bg-gray-900 rounded-xl border border-border">
            {searchQuery ? "No links match your search filter." : "No links created yet. Click 'Create New Link' above to get started!"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
