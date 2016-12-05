# Sasaya Slider

A RWD images/text slider with a side column.

[See Demo Page.](https://unisharp.github.io/sasaya-slider/)

## Usage

```jade
.sasaya-slider
  .arrow
    .prev(data-method='prev')
      i.fa.fa-chevron-left
    .next(data-method='next')
      i.fa.fa-chevron-right
  .main
    - for (var i = 1; i <= 5; i++)
      .item(style="background-image: url('http://fakeimg.pl/1450x480');")
        a(href="#", target='_blank')
          .text-wrapper
            h1= 'Title ' + i
            h4= 'Content ' + i

script.
  $(function () {
    $('.sasaya-slider .arrow > *').click(function () {
      $('.sasaya-slider').sasayaSlider($(this).data('method'));
    });

    $('.sasaya-slider').sasayaSlider();
  });
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
