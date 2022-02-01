import { CircularProgress } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Header from "../../../components/Header";
import { intervals } from "../../../components/IntervalSelector/IntervalSelector";
import TitleCard from "../../../components/TitleCard";
import { api } from "../../../services/api";
import { UnboxPromise } from "../../../services/types";
import s from "./index.module.css";
import Track from "./Album";
import Album from "./Album";

export default function Albums() {
  const [interval, setInterval] = useState("0");
  const [items, setItems] = useState<
    UnboxPromise<ReturnType<typeof api["getBestAlbums"]>>["data"]
  >([]);
  const [hasMore, setHasMore] = useState(true);

  const fetch = useCallback(async () => {
    if (!hasMore) return;
    try {
      const result = await api.getBestAlbums(
        intervals[+interval].interval.start,
        intervals[+interval].interval.end,
        10,
        items.length
      );
      setItems([...items, ...result.data]);
      setHasMore(result.data.length === 10);
    } catch (e) {
      console.error(e);
    }
  }, [hasMore, interval, items]);

  useEffect(() => {
    if (items.length === 0) {
      fetch();
    }
    // Initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval]);

  const changeInterval = useCallback((newInterval: string) => {
    setInterval(newInterval);
    setItems([]);
    setHasMore(true);
  }, []);

  return (
    <div>
      <Header
        title="Top albums"
        subtitle="Here are the albums you listened to the most"
        interval={interval}
        onChange={changeInterval}
      />
      <div className={s.content}>
        <TitleCard title="Top albums">
          <Track line />
          <InfiniteScroll
            key={interval}
            next={fetch}
            hasMore={hasMore}
            dataLength={items.length}
            loader={<CircularProgress />}
          >
            {items.map((item) => (
              <Album
                key={item.album.id}
                artists={[item.artist]}
                album={item.album}
                count={item.count}
                totalCount={item.total_count}
                duration={item.duration_ms}
                totalDuration={item.total_duration_ms}
              />
            ))}
          </InfiniteScroll>
        </TitleCard>
      </div>
    </div>
  );
}
