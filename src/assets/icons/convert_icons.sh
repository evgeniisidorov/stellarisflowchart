for file in *.png
do
   echo "$(basename "$file" .dds).png"
done

# for f in *.png; do echo mv "$f" "${f/_*_/_}"; done