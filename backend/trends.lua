--[[

    DATA Format
{
    TrendName: {
        "name": string,
        "slug": string,
        "views": number,
        "description": string,
        "followers": {{address: string, created_at: string}},
        "total_followers": number,
        "upvotes": {address_string = {vote: number, created_at: string}},
        "total_upvotes": number,
        "num_updates": number,
        "last_updated": string,
        "comments": {
            id: {
                id: string,
                from: string,
                comment: string,
                upvotes: {address_string = {vote: number, created_at: string}},
                total_upvotes: number,
                replies: {
                    id: {
                        id: string,
                        from: string,
                        comment: string,
                        upvotes: {address_string = {vote: number, created_at: string}},
                        total_upvotes: number,
                    }
                }
            }
        },
        "handles": {
            {
                handle: string,
                num_tweets: number,
                total_likes: number,
            }
        },
        "byDay": {
            YYYY-MM-DD: {
                "summary": string,
                "upvotes": {address_string = {vote: number, created_at: string}},
                "total_upvotes": number,
                "comments": {
                    id: {
                        id: string,
                        address: string,
                        comment: string,
                        upvotes: {address_string = {vote: number, created_at: string}},
                        total_upvotes: number,
                        replies: {
                            id: {
                                id: string,
                                address: string,
                                comment: string,
                                upvotes: {address_string = {vote: number, created_at: string}},
                                total_upvotes: number,
                            }
                        }
                    }
                },
                "tweets": {
                    {
                        id: string,
                        handle: string
                    },
                    {
                        id: string,
                        handle: string
                    }
                }
            }
        }
    }
}
]]

function getTableLength(t)
    local count = 0
    for _ in pairs(t) do
        count = count + 1
    end
    return count
end

function _checkTrendExists(trend)
    return DATA[trend] ~= nil
end

function _sendError(msg, error)
    msg.reply({ Status = "Error", Error = error })
end

local function getTrends(msg)
    local data = {}
    for trend, trendData in pairs(DATA) do
        -- remove the byDay from the trendData
        trendData.byDay = nil
        data[trend] = trendData
    end
    msg.reply({ Status = "Success", Data = data })
end

local function getTrend(msg)
    local trend = msg.Tags.Trend
    if not _checkTrendExists(trend) then
        _sendError(msg, "Trend not found")
        return
    end
    msg.reply({ Status = "Success", Data = DATA[trend] })
end

local function toggleFollowTrend(msg)
    local trend = msg.Tags.Trend
    local timestamp = msg.Timestamp
    local from = msg.From

    if not _checkTrendExists(trend) then
        _sendError(msg, "Trend not found")
        return
    end
    if DATA[trend].followers[from] ~= nil then
        DATA[trend].followers[from] = nil
        DATA[trend].total_followers = DATA[trend].total_followers - 1
    else
        DATA[trend].followers[from] = { created_at = timestamp }
        DATA[trend].total_followers = DATA[trend].total_followers + 1
    end
    msg.reply({ Status = "Success" })
end

local function toggleUpVoteTrendUpdate(msg)
    local trend = msg.Tags.Trend
    local day = msg.Tags.Day
    local vote = msg.Tags.Vote or 1
    local timestamp = msg.Timestamp
    local from = msg.From
    if not _checkTrendExists(trend) then
        _sendError(msg, "Trend not found")
        return
    end
    if DATA[trend].byDay[day] == nil then
        _sendError(msg, "Day not found")
        return
    end
    local action = nil
    if DATA[trend].byDay[day].upvotes[from] ~= nil then
        action = "removed " .. vote .. " upvote"
        DATA[trend].byDay[day].upvotes[from] = nil
        DATA[trend].byDay[day].total_upvotes = DATA[trend].byDay[day].total_upvotes - vote
    else
        action = "added " .. vote .. " upvote"
        DATA[trend].byDay[day].upvotes[from] = { vote = vote, created_at = timestamp }
        DATA[trend].byDay[day].total_upvotes = DATA[trend].byDay[day].total_upvotes + vote
    end
    msg.reply({ Status = "Success", UpVoteAction = action })
end

local function toggleUpVoteTrend(msg)
    local trend = msg.Tags.Trend
    local vote = msg.Tags.Vote or 1
    local timestamp = msg.Timestamp
    local from = msg.From
    local action = nil
    if DATA[trend].upvotes[from] ~= nil then
        action = "removed " .. vote .. " upvote"
        DATA[trend].upvotes[from] = nil
        DATA[trend].total_upvotes = DATA[trend].total_upvotes - vote
    else
        action = "added " .. vote .. " upvote"
        DATA[trend].upvotes[from] = { vote = vote, created_at = timestamp }
        DATA[trend].total_upvotes = DATA[trend].total_upvotes + vote
    end
    msg.reply({ Status = "Success", UpVoteAction = action })
end

local function addCommentToTrendUpdate(msg)
    local trend = msg.Tags.Trend
    local day = msg.Tags.Day
    local commentID = msg.Tags.CommentID -- to reply to a comment
    local comment = msg.Tags.Comment
    local timestamp = msg.Timestamp
    local from = msg.From

    if not _checkTrendExists(trend) then
        _sendError(msg, "Trend not found")
        return
    end
    if DATA[trend].byDay[day] == nil then
        _sendError(msg, "Day not found")
        return
    end

    if commentID then
        if DATA[trend].byDay[day].comments[commentID] == nil then
            _sendError(msg, "Comment not found")
            return
        end
        -- Generate unique reply ID
        local replyID = commentID .. "-" .. os.time()
        -- Initialize replies as map if it doesn't exist
        DATA[trend].byDay[day].comments[commentID].replies = DATA[trend].byDay[day].comments[commentID].replies or {}
        -- Add reply to map using replyID as key
        DATA[trend].byDay[day].comments[commentID].replies[replyID] = {
            id = replyID,
            comment = comment,
            created_at = timestamp,
            from = from,
            upvotes = {},
            total_upvotes = 0
        }
    else
        -- Generate unique comment ID
        local newCommentID = "c-" .. os.time()
        -- Initialize comments as map if it doesn't exist
        DATA[trend].byDay[day].comments = DATA[trend].byDay[day].comments or {}
        -- Add comment to map using newCommentID as key
        DATA[trend].byDay[day].comments[newCommentID] = {
            id = newCommentID,
            comment = comment,
            created_at = timestamp,
            from = from,
            replies = {},
            upvotes = {},
            total_upvotes = 0
        }
    end
    msg.reply({ Status = "Success", Data = DATA[trend].byDay[day].comments })
end

local function addCommentToTrend(msg)
    local trend = msg.Tags.Trend
    local comment = msg.Tags.Comment
    local commentID = msg.Tags.CommentID -- to reply to a comment
    local timestamp = msg.Timestamp
    local from = msg.From

    if not _checkTrendExists(trend) then
        _sendError(msg, "Trend not found")
        return
    end

    DATA[trend].comments = DATA[trend].comments or {}

    if commentID then
        if DATA[trend].comments[commentID] == nil then
            _sendError(msg, "Comment not found")
            return
        end

        local newReplyID = commentID .. "-" .. getTableLength(DATA[trend].comments[commentID].replies) + 1
        DATA[trend].comments[commentID].replies[newReplyID] = {
            id = newReplyID,
            comment = comment,
            created_at = timestamp,
            from = from,
            upvotes = {},
            total_upvotes = 0
        }
    else
        local newCommentID = "c-" .. getTableLength(DATA[trend].comments) + 1
        DATA[trend].comments[newCommentID] = {
            id = newCommentID,
            comment = comment,
            created_at = timestamp,
            from = from,
            replies = {},
            upvotes = {},
            total_upvotes = 0
        }
    end
    msg.reply({ Status = "Success", Data = DATA[trend].comments })
end

local function toggleUpVoteComment(msg)
    local trend = msg.Tags.Trend
    local day = msg.Tags.Day             -- to upvote a comment on an update, else upvoting Trend comment
    local commentID = msg.Tags.CommentID -- to upvote a comment
    local replyID = msg.Tags.ReplyID     -- to upvote a reply
    local vote = msg.Tags.Vote or 1
    local timestamp = msg.Timestamp
    local from = msg.From

    if not _checkTrendExists(trend) then
        _sendError(msg, "Trend not found")
        return
    end

    if not commentID and not replyID then
        _sendError(msg, "No comment or reply ID provided")
        return
    end

    local action = nil

    -- if upvoting a comment (or reply) on an update
    if day then
        if DATA[trend].byDay[day] == nil then
            _sendError(msg, "Day not found")
            return
        end
        if DATA[trend].byDay[day].comments[commentID] == nil then
            _sendError(msg, "Comment not found")
            return
        end
        if replyID then
            if DATA[trend].byDay[day].comments[commentID].replies[replyID] == nil then
                _sendError(msg, "Reply not found")
                return
            end
            DATA[trend].byDay[day].comments[commentID].replies[replyID].upvotes = DATA[trend].byDay[day].comments
                [commentID].replies[replyID].upvotes or {}
            if DATA[trend].byDay[day].comments[commentID].replies[replyID].upvotes[from] ~= nil then
                action = "removed " .. vote .. " upvote from reply"
                DATA[trend].byDay[day].comments[commentID].replies[replyID].upvotes[from] = nil
                DATA[trend].byDay[day].comments[commentID].replies[replyID].total_upvotes = DATA[trend].byDay[day]
                    .comments
                    [commentID].replies[replyID].total_upvotes - vote
            else
                action = "added " .. vote .. " upvote to reply"
                DATA[trend].byDay[day].comments[commentID].replies[replyID].upvotes[from] = {
                    vote = vote,
                    created_at =
                        timestamp
                }
                DATA[trend].byDay[day].comments[commentID].replies[replyID].total_upvotes = DATA[trend].byDay[day]
                    .comments
                    [commentID].replies[replyID].total_upvotes + vote
            end
        else
            DATA[trend].byDay[day].comments[commentID].upvotes = DATA[trend].byDay[day].comments[commentID].upvotes or {}
            if DATA[trend].byDay[day].comments[commentID].upvotes[from] ~= nil then
                action = "removed " .. vote .. " upvote from comment"
                DATA[trend].byDay[day].comments[commentID].upvotes[from] = nil
                DATA[trend].byDay[day].comments[commentID].total_upvotes = DATA[trend].byDay[day].comments[commentID]
                    .total_upvotes - vote
            else
                action = "added " .. vote .. " upvote to comment"
                DATA[trend].byDay[day].comments[commentID].upvotes[from] = { vote = vote, created_at = timestamp }
                DATA[trend].byDay[day].comments[commentID].total_upvotes = DATA[trend].byDay[day].comments[commentID]
                    .total_upvotes + vote
            end
        end
    else
        -- if upvoting a trend comment
        if DATA[trend].comments[commentID] == nil then
            _sendError(msg, "Comment not found")
            return
        end
        if replyID then
            if DATA[trend].comments[commentID].replies[replyID] == nil then
                _sendError(msg, "Reply not found")
                return
            end
            DATA[trend].comments[commentID].replies[replyID].upvotes = DATA[trend].comments[commentID].replies[replyID]
                .upvotes or {}
            if DATA[trend].comments[commentID].replies[replyID].upvotes[from] ~= nil then
                action = "removed " .. vote .. " upvote from reply"
                DATA[trend].comments[commentID].replies[replyID].upvotes[from] = nil
                DATA[trend].comments[commentID].replies[replyID].total_upvotes = DATA[trend].comments[commentID]
                    .replies[replyID].total_upvotes - vote
            else
                action = "added " .. vote .. " upvote to reply"
                DATA[trend].comments[commentID].replies[replyID].upvotes[from] = {
                    vote = vote,
                    created_at = timestamp
                }
                DATA[trend].comments[commentID].replies[replyID].total_upvotes = DATA[trend].comments[commentID]
                    .replies[replyID].total_upvotes + vote
            end
        else
            DATA[trend].comments[commentID].upvotes = DATA[trend].comments[commentID].upvotes or {}
            if DATA[trend].comments[commentID].upvotes[from] ~= nil then
                action = "removed " .. vote .. " upvote from comment"
                DATA[trend].comments[commentID].upvotes[from] = nil
                DATA[trend].comments[commentID].total_upvotes = DATA[trend].comments[commentID].total_upvotes - vote
            else
                action = "added " .. vote .. " upvote to comment"
                DATA[trend].comments[commentID].upvotes[from] = { vote = vote, created_at = timestamp }
                DATA[trend].comments[commentID].total_upvotes = DATA[trend].comments[commentID].total_upvotes + vote
            end
        end
    end

    msg.reply({ Status = "Success", UpVoteAction = action })
end

local function updateViewCount(msg)
    local trend = msg.Tags.Trend
    if not _checkTrendExists(trend) then
        _sendError(msg, "Trend not found")
        return
    end
    DATA[trend].total_views = DATA[trend].total_views or 0
    DATA[trend].total_views = DATA[trend].total_views + 1
    msg.reply({ Status = "Success" })
end

Handlers.add("GetTrends", { Action = "GetTrends" }, getTrends)
Handlers.add("GetTrend", { Action = "GetTrend" }, getTrend)
Handlers.add("ToggleFollowTrend", { Action = "ToggleFollowTrend" }, toggleFollowTrend)
Handlers.add("ToggleUpVoteTrendUpdate", { Action = "ToggleUpVoteTrendUpdate" }, toggleUpVoteTrendUpdate)
Handlers.add("ToggleUpVoteTrend", { Action = "ToggleUpVoteTrend" }, toggleUpVoteTrend)
Handlers.add("AddCommentToTrendUpdate", { Action = "AddCommentToTrendUpdate" }, addCommentToTrendUpdate)
Handlers.add("ToggleUpVoteComment", { Action = "ToggleUpVoteComment" }, toggleUpVoteComment)
Handlers.add("AddCommentToTrend", { Action = "AddCommentToTrend" }, addCommentToTrend)
Handlers.add("UpdateViewCount", { Action = "UpdateViewCount" }, updateViewCount)
