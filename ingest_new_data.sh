#!/bin/bash

cp ~/PROD/PtolemaicModel/mars_theta.txt ptolemaic_mars_data.csv
awk '{ printf("%03d\t%s\n", count, $0); count++; }' count=1 ptolemaic_mars_data.csv > ptolemaic_mars_data_numbered.csv 
join ptolemaic_mars_data_numbered.csv earth_mars_data_numbered.csv > joined_ptolemaic_keplerian_data_numbered.csv
cp joined_ptolemaic_keplerian_data_numbered.csv joined_ptolemaic_keplerian_data.csv 
sed 's:^[0-9][0-9]* ::' joined_ptolemaic_keplerian_data.csv | sed 's: :;\(:' | sed 's: :\);\(:' | sed 's:$:\):' > joined_ptolemaic_keplerian_data.txt
