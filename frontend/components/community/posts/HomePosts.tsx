"use client";

import { useGetHomePosts } from "@/lib/hooks/post.hook";
import React from "react";
import PostsCard from "./PostsCard";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

const HomePosts = () => {
  const { data: posts } = useGetHomePosts();
  return (
    <div>
      {posts?.length > 0 ? (
        <Card className="h-[600px] flex flex-col border-border shadow-sm overflow-hidden">
          <CardContent className="p-0 flex-1 relative min-h-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {posts?.map((post: any) => (
                  <PostsCard key={post.id} post={post} />
                ))}{" "}
              </div>
            </ScrollArea>
            {/* Fade Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </CardContent>

          <div className="p-3 border-t border-border/50 bg-muted/20 text-center">
            <Link
              href="/communities"
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Explore all communities
            </Link>
          </div>
        </Card>
      ) : (
        <div className="flex items-center justify-center border h-30 rounded-xl border-border">
          <p className="text-muted-foreground">No posts yet</p>
        </div>
      )}
    </div>
  );
};

export default HomePosts;
