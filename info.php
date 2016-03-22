<?php
	// Узнать версию Apache
	$version = apache_get_version();
	echo "$version\n";

	// Показать только информацию модуля
	phpinfo(INFO_MODULES);
?>