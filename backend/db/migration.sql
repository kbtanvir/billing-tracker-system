-- valid userproject items
SELECT utp.user_id, utp.project_id
FROM users_to_project utp
JOIN projects p ON utp.project_id = p.id LIMIT 100


-- referencing wrong project ids

SELECT *
FROM users_to_project utp
LEFT JOIN projects p ON utp.project_id = p.id
WHERE p.id IS NULL LIMIT 100



DELETE FROM users_to_project
WHERE project_id IN (
    'c90773cc-4736-4432-8acd-0d2c6d1f5c34',
    'db9d975f-23a1-4f62-990e-fbd7bc4e7a92',
    'e8c35e8c-a8d5-4c76-8c93-1875f7179432',
    '06ae0e66-7501-47c8-9f4e-c5e24a25bf9b'
);