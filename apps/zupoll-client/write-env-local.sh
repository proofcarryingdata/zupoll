# called at build-time on render.com

rm ./.env.local
echo "NEXT_PUBLIC_STAGING='$NEXT_PUBLIC_STAGING'" >> ./.env.local
