-- Streaming service analytics.
-- Each query is preceded by a "-- name: <id>" marker so run_queries.py can
-- execute them individually. Queries showcase JOINs, CTEs, aggregation, and
-- window functions (RANK, LAG, running SUM).

-- name: genre_performance
-- Views, average rating, and completion rate per genre (JOIN + aggregation).
SELECT
    t.genre,
    COUNT(*)                              AS views,
    ROUND(AVG(v.rating), 2)               AS avg_rating,
    ROUND(100.0 * AVG(v.completed), 1)    AS completion_rate_pct,
    ROUND(SUM(v.minutes_watched) / 60.0)  AS hours_watched
FROM views v
JOIN titles t ON t.title_id = v.title_id
GROUP BY t.genre
ORDER BY views DESC;

-- name: top_titles_per_genre
-- Top 3 most-watched titles within each genre using RANK() window function.
WITH title_views AS (
    SELECT t.genre, t.title, COUNT(*) AS views
    FROM views v
    JOIN titles t ON t.title_id = v.title_id
    GROUP BY t.genre, t.title
),
ranked AS (
    SELECT
        genre, title, views,
        RANK() OVER (PARTITION BY genre ORDER BY views DESC) AS rnk
    FROM title_views
)
SELECT genre, title, views, rnk
FROM ranked
WHERE rnk <= 3
ORDER BY genre, rnk;

-- name: monthly_growth
-- Monthly views with a running total and month-over-month growth via LAG().
WITH monthly AS (
    SELECT strftime('%Y-%m', watch_date) AS month, COUNT(*) AS views
    FROM views
    GROUP BY month
)
SELECT
    month,
    views,
    SUM(views) OVER (ORDER BY month) AS running_total,
    ROUND(
        100.0 * (views - LAG(views) OVER (ORDER BY month))
        / LAG(views) OVER (ORDER BY month), 1
    ) AS mom_growth_pct
FROM monthly
ORDER BY month;

-- name: engagement_by_plan
-- Average engagement per user segmented by subscription plan (JOIN + GROUP BY).
SELECT
    u.plan,
    COUNT(DISTINCT u.user_id)                            AS users,
    ROUND(COUNT(v.view_id) * 1.0 / COUNT(DISTINCT u.user_id), 1) AS avg_views_per_user,
    ROUND(SUM(v.minutes_watched) / 60.0)                 AS total_hours
FROM users u
LEFT JOIN views v ON v.user_id = u.user_id
GROUP BY u.plan
ORDER BY avg_views_per_user DESC;

-- name: revenue_by_country
-- Estimated monthly subscription revenue by country.
SELECT
    country,
    COUNT(*)                       AS subscribers,
    ROUND(SUM(monthly_price), 2)   AS monthly_revenue
FROM users
GROUP BY country
ORDER BY monthly_revenue DESC;

-- name: power_users
-- Rank the top 10 users by total minutes watched (window ordering).
SELECT
    user_id,
    total_minutes,
    RANK() OVER (ORDER BY total_minutes DESC) AS watch_rank
FROM (
    SELECT user_id, SUM(minutes_watched) AS total_minutes
    FROM views
    GROUP BY user_id
)
ORDER BY watch_rank
LIMIT 10;
