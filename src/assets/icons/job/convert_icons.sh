for file in *.dds
do
   convert $file "$(basename "$file" .dds).png"
   # echo "$(basename "$file" .dds).png"
done

# for f in *.png; do echo mv "$f" "${f/_*_/_}"; done