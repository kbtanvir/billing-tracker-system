local redis = require "resty.redis"

local _M = {}

function _M.get_home_and_prefix_by_subdomain(subdomain)
    if not subdomain or subdomain == "" then
        ngx.log(ngx.ERR, "Invalid subdomain provided")
        return nil, nil
    end

    local red = redis:new()

    -- red:set_timeout(1000)
    
    -- TODO: Use environment variables
    local redis_host = 'redis'
    local redis_port =  6377
    
    local ok, err = red:connect(redis_host, redis_port)

    if not ok then
        ngx.log(ngx.ERR, "Failed to connect to Redis: " .. (err or "unknown error"))
        return nil, nil
    end

    local prefix_key = "subdomain:" .. subdomain
    local home_key = "subdomain:" .. subdomain .. ":home"
    local is_banned = "subdomain:" .. subdomain .. ":banned"
    local store_id = "subdomain:" .. subdomain .. ":store-id"

 

    -- Get both values in a pipeline
    red:init_pipeline()
    red:get(prefix_key)
    red:get(home_key)
    red:exists(is_banned)
    red:get(store_id)
    
    local results, err = red:commit_pipeline()
    if not results then
        ngx.log(ngx.ERR, "Failed to get Redis values: " .. (err or "unknown error"))
        red:close()
        return nil, nil
    end

    local prefix = results[1]
    local home = results[2]
    local banned = results[3] == 1
    local store_id = results[4]

    ngx.log(ngx.NOTICE, "redis values for subdomain: ", home)

    -- Close the Redis connection
    red:close()

    -- Handle ngx.null values
    if prefix == ngx.null then prefix = nil end
    if home == ngx.null then home = nil end
    if store_id == ngx.null then store_id = nil end

    return prefix, home, banned, store_id
end

return _M.get_home_and_prefix_by_subdomain