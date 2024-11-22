--[[

    DATA Format
{
    TrendName: {
        "slug": string,
        "description": string,
        "followers": {{address: string, created_at: string}},
        "total_followers": number,
        "upvotes": {address_string = {vote: number, created_at: string}},
        "total_upvotes": number,
        "num_updates": number,
        "last_updated": string,
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

local function getTrends(msg)
    local data = {}
    for trend, trendData in pairs(DATA) do
        -- remove the byDay from the trendData
        trendData.byDay = nil
        data[trend] = trendData
    end
    msg.reply({ Data = data })
end

local function getTrend(msg)
    local trend = msg.Tags.Trend
    if not _checkTrendExists(trend) then
        msg.reply({ Error = "Trend not found" })
        return
    end
    msg.reply({ Data = DATA[trend] })
end

local function toggleUpVoteTrendUpdate(msg)
    local trend = msg.Tags.Trend
    local day = msg.Tags.Day
    local vote = msg.Tags.Vote or 1
    local timestamp = msg.Timestamp
    local from = msg.From
    if not _checkTrendExists(trend) then
        msg.reply({ Error = "Trend not found" })
        return
    end
    if DATA[trend].byDay[day] == nil then
        msg.reply({ Error = "Day not found" })
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
    msg.reply({ Success = true, UpVoteAction = action })
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
    msg.reply({ Success = true, UpVoteAction = action })
end

local function addCommentToTrendUpdate(msg)
    local trend = msg.Tags.Trend
    local day = msg.Tags.Day
    local commentID = msg.Tags.CommentID -- to reply to a comment
    local comment = msg.Tags.Comment
    local timestamp = msg.Timestamp
    local from = msg.From

    if not _checkTrendExists(trend) then
        msg.reply({ Error = "Trend not found" })
        return
    end
    if DATA[trend].byDay[day] == nil then
        msg.reply({ Error = "Day not found" })
        return
    end

    if commentID then
        if DATA[trend].byDay[day].comments[commentID] == nil then
            msg.reply({ Error = "Comment not found" })
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
            from = from
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
            replies = {}
        }
    end
end

local function toggleUpVoteComment(msg)
    local trend = msg.Tags.Trend
    local day = msg.Tags.Day
    local commentID = msg.Tags.CommentID -- to upvote a comment
    local replyID = msg.Tags.ReplyID     -- to upvote a reply
    local vote = msg.Tags.Vote or 1
    local timestamp = msg.Timestamp
    local from = msg.From

    if not _checkTrendExists(trend) then
        msg.reply({ Error = "Trend not found" })
        return
    end
    if DATA[trend].byDay[day] == nil then
        msg.reply({ Error = "Day not found" })
        return
    end
    if commentID then
        if DATA[trend].byDay[day].comments[commentID] == nil then
            msg.reply({ Error = "Comment not found" })
            return
        end
    end
    if replyID then
        if DATA[trend].byDay[day].comments[commentID].replies[replyID] == nil then
            msg.reply({ Error = "Reply not found" })
            return
        end
    end

    if not commentID and not replyID then
        msg.reply({ Error = "No comment or reply ID provided" })
        return
    end

    local action = nil
    if commentID then
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

    if replyID then
        if DATA[trend].byDay[day].comments[commentID].replies[replyID].upvotes[from] ~= nil then
            action = "removed " .. vote .. " upvote from reply"
            DATA[trend].byDay[day].comments[commentID].replies[replyID].upvotes[from] = nil
            DATA[trend].byDay[day].comments[commentID].replies[replyID].total_upvotes = DATA[trend].byDay[day].comments
                [commentID].replies[replyID].total_upvotes - vote
        else
            action = "added " .. vote .. " upvote to reply"
            DATA[trend].byDay[day].comments[commentID].replies[replyID].upvotes[from] = {
                vote = vote,
                created_at =
                    timestamp
            }
            DATA[trend].byDay[day].comments[commentID].replies[replyID].total_upvotes = DATA[trend].byDay[day].comments
                [commentID].replies[replyID].total_upvotes + vote
        end
    end

    msg.reply({ Success = true, UpVoteAction = action })
end

Handlers.add("GetTrends", { Action = "GetTrends" }, getTrends)
Handlers.add("GetTrend", { Action = "GetTrend" }, getTrend)
Handlers.add("ToggleUpVoteTrendUpdate", { Action = "ToggleUpVoteTrendUpdate" }, toggleUpVoteTrendUpdate)
Handlers.add("ToggleUpVoteTrend", { Action = "ToggleUpVoteTrend" }, toggleUpVoteTrend)
Handlers.add("AddCommentToTrendUpdate", { Action = "AddCommentToTrendUpdate" }, addCommentToTrendUpdate)
Handlers.add("ToggleUpVoteComment", { Action = "ToggleUpVoteComment" }, toggleUpVoteComment)
