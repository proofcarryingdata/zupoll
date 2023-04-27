# called at build-time on render.com

rm ./.env.local
echo "NEXT_PUBLIC_STAGING='true'" >> ./.env.local
