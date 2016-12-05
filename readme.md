# Sasaya Slider

A RWD images/text slider with a side column.

[See Demo Page.](https://unisharp.github.io/sasaya-slider/)

## Usage

### Download and install

```bash
bower install sasaya-slider --save
```

### Include necessary scripts and styles

```html
<!DOCTYPE html>
<html lang="en">
<head>
    ...
    <link rel="stylesheet" href="bower_components/sasaya-slider/dist/css/sasaya-slider.min.css">
</head>
<body>
    ...
    <script src="bower_components/jquery/dist/jquery.min.js"></script>
    <script src="bower_components/sasaya-slider/dist/js/sasaya-slider.min.js"></script>
</body>
</html>
```

### Add HTML Layout

```html
<!-- Slider main container -->
<div class="sasaya-slider">
    <!-- If we need navigation buttons -->
    <div class="arrow">
        <div class="prev" data-method="prev">
            <i class="fa fa-chevron-left">
        </div>
        <div class="next" data-method="next">
            <i class="fa fa-chevron-right">
        </div>
    </div>

    <!-- Additional required wrapper -->
    <div class="main">
        <!-- Sliders -->
        <div class="item" style="background-image: url('http://fakeimg.pl/1450x480');">
            <a href="#" target="_blank">
                <div class="text-wrapper">
                    <h1>Title 1</h1>
                    <h4>Content 1</h4>
                </div>
            </a>
        </div>
        <div class="item" style="background-image: url('http://fakeimg.pl/1450x480');">
            <a href="#" target="_blank">
                <div class="text-wrapper">
                    <h1>Title 2</h1>
                    <h4>Content 2</h4>
                </div>
            </a>
        </div>
        <div class="item" style="background-image: url('http://fakeimg.pl/1450x480');">
            <a href="#" target="_blank">
                <div class="text-wrapper">
                    <h1>Title 3</h1>
                    <h4>Content 3</h4>
                </div>
            </a>
        </div>
        <div class="item" style="background-image: url('http://fakeimg.pl/1450x480');">
            <a href="#" target="_blank">
                <div class="text-wrapper">
                    <h1>Title 4</h1>
                    <h4>Content 4</h4>
                </div>
            </a>
        </div>
        <div class="item" style="background-image: url('http://fakeimg.pl/1450x480');">
            <a href="#" target="_blank">
                <div class="text-wrapper">
                    <h1>Title 5</h1>
                    <h4>Content 5</h4>
                </div>
            </a>
        </div>
        ...
    </div>
</div>
```

### Initialize

```html
<body>
    ...
    <script>
        $(function () {
            $('.sasaya-slider').sasayaSlider();

            // If we need navigation buttons
            $('.sasaya-slider .arrow > *').click(function () {
                $('.sasaya-slider').sasayaSlider($(this).data('method'));
            });
        });
    </script>
</body>
```

## Contributing

Clone a copy:

```bash
git clone git@github.com:UniSharp/sasaya-slider.git
```

Enter the plugin directory:

```bash
cd sasaya-slider
```

Install dependencies:

```bash
yarn install && bower install
```

Now you can run `gulp` command to rebuild distributed CSS and JavaScript files, as well as demo page.

You can also run `gulp watch` command and open <http://localhost:3000/demo> to happy coding.
