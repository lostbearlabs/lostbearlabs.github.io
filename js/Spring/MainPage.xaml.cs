using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using System.Windows.Threading;

namespace Spring
{
    public partial class MainPage : UserControl
    {
        double[] _x, _dx, _y, _dy;
        int _num;
        Ellipse[] _dot;
        DispatcherTimer _timer;
        ShapeManager _manager;


        public MainPage()
        {
            InitializeComponent();

            _manager = new ShapeManager(ThePanel);

            _num = 10;
            _dot = new Ellipse[_num];
            _x = new double[_num];
            _y = new double[_num];
            _dx = new double[_num];
            _dy = new double[_num];

            for (int i = 0; i < _num; i++)
            {
                Ellipse z = new Ellipse();
                if( i==0 || i==_num-1 )
                    z.Fill = new SolidColorBrush(Colors.Red);
                else
                    z.Fill = new SolidColorBrush(Colors.Green);
                z.Width = 20;
                z.Height = 20;
                _dot[i] = z;

                double x = (i+1) * ThePanel.Width / (_num+2);
                double y = ThePanel.Height / 2;
                _x[i] = x;
                _y[i] = y;

                z.SetValue(Canvas.TopProperty, y);
                z.SetValue(Canvas.LeftProperty, x);

                ThePanel.Children.Add(z);
                _manager.Add(z);
            }

            _timer = new DispatcherTimer();
            _timer.Interval = new TimeSpan(0, 0, 0, 0, 100);
            _timer.Tick += new EventHandler(_timer_Tick);
            _timer.Start();
        }

        void _timer_Tick(object sender, EventArgs e)
        {
            UpdatePositions();
        }


        void UpdatePositions()
        {
            // gravity
            double f1 = 2.0;
            double f2x = 1.0;

            // spring constant
            double f2y = 1.0;
            double f3x = 0.05;

            // time slice
            double f3y = 0.05;

            // friction
            double f4x = 0.1;
            double f4y = 0.1;
 
            for (int i = 0; i < _num; i++)
            {
                if (i == 0 || i == _num - 1)
                    continue;

                if (_manager.IsTracked(_dot[i]))
                    continue;

                double ax = 0;
                double ay = 0;

                ay = f1;
                ax = 0;

                ax += f2x * (_x[i - 1] - _x[i]);
                ay += f2y * (_y[i - 1] - _y[i] );

                ax += f2x * (_x[i + 1] - _x[i] );
                ay += f2y * (_y[i + 1] - _y[i] );

                ax -= f4x * _dx[i];
                ay -= f4y * _dy[i];

                _dx[i] += f3x * ax;
                _dy[i] += f3y * ay;
            }

            for( int i=0; i<_num; i++ )
            {
                if (_manager.IsTracked(_dot[i]))
                {
                    _x[i] = (double)_dot[i].GetValue(Canvas.LeftProperty);
                    _y[i] = (double)_dot[i].GetValue(Canvas.TopProperty);
                }
                else
                {
                    _x[i] += _dx[i];
                    _y[i] += _dy[i];

                    _dot[i].SetValue(Canvas.TopProperty, _y[i]);
                    _dot[i].SetValue(Canvas.LeftProperty, _x[i]);
                }
            }

        }

    }
}
